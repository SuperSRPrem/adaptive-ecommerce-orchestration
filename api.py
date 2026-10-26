from typing import (
    Any,
    Dict,
    List,
    Literal,
    Optional
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from search_engine import SearchEngine
from evaluator import Evaluator

import json


app = FastAPI(
    title="Adaptive E-Commerce Search API",
    version="1.0"
)


# Allow friend's frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


engine = SearchEngine()
evaluator = Evaluator(engine)


# =====================================================
# REQUEST MODELS
# =====================================================

class SearchRequest(BaseModel):

    query: str

    mode: Literal[
        "baseline",
        "optimized",
        "orchestrated"
    ]

    category: Literal[
        "phone",
        "laptop",
        "watch",
        "refrigerator"
    ]

    search_type: Literal[
        "specific",
        "general"
    ]

    k: int = Field(
        default=5,
        ge=1,
        le=20
    )


class EvaluationRequest(BaseModel):

    search_type: Literal[
        "specific",
        "general"
    ]

    results: List[
        Dict[str, Any]
    ]

    target_product_id: Optional[str] = None

    target_constraints: Optional[
        Dict[str, Any]
    ] = None


# =====================================================
# HEALTH
# =====================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "products": len(
            engine.products
        )
    }

@app.get("/scenarios")
def scenarios():

    with open(
        "data/scenarios.json",
        "r"
    ) as f:
        data = json.load(f)

    return data


# =====================================================
# PRODUCT TARGET LIST
# For website target-selection screen
# =====================================================

@app.get("/targets")
def targets(
    category: str,
    limit: int = 30
):

    if category not in [
        "phone",
        "laptop",
        "watch",
        "refrigerator"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Invalid category"
        )

    data = engine.products[
        engine.products["category"]
        == category
    ].copy()

    data = data.sort_values(
        "product_title"
    )

    data = data.head(limit)

    return data[
        [
            "product_id",
            "product_title",
            "product_brand",
            "product_color",
            "price"
        ]
    ].to_dict(
        orient="records"
    )


# =====================================================
# SEARCH
# Hidden target is NOT accepted here
# =====================================================

@app.post("/search")
def search(request: SearchRequest):

    try:

        return engine.search(
            query=request.query,
            mode=request.mode,
            category=request.category,
            search_type=request.search_type,
            k=request.k
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =====================================================
# EVALUATION
# Called only AFTER search results exist
# =====================================================

@app.post("/evaluate")
def evaluate(
    request: EvaluationRequest
):

    try:

        return evaluator.evaluate(
            search_type=
                request.search_type,

            results=
                request.results,

            target_product_id=
                request.target_product_id,

            target_constraints=
                request.target_constraints
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
