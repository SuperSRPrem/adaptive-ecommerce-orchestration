import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

import re
import time
import pandas as pd

from search_engine import SearchEngine


engine = SearchEngine()

ground = pd.read_csv(
    "data/query_products.csv"
)

ground["product_id"] = (
    ground["product_id"].astype(str)
)

engine.products["product_id"] = (
    engine.products["product_id"]
    .astype(str)
)

catalog_ids = set(
    engine.products["product_id"]
)


# =====================================================
# CLEAN QUERY
# =====================================================

def clean_query(query):

    query = str(query).strip()

    if len(query) < 5 or len(query) > 100:
        return False

    if len(query.split()) < 2:
        return False

    letters = len(
        re.findall(
            r"[A-Za-z]",
            query
        )
    )

    if (
        letters /
        max(len(query), 1)
        < 0.65
    ):
        return False

    return True


# =====================================================
# BUILD CONTROLLED SUBSTITUTE CASES
#
# We want:
#
# 1. Real ESCI query
# 2. Best semantic product is Exact
# 3. Exactly one Exact product in our cleaned catalog
# 4. At least one Amazon-labelled Substitute exists
#
# Then for the benchmark ONLY:
#
# Exact target internal stock = 0
# Exact target partner available = 0
#
# This forces all systems into a genuine
# substitute-only situation.
# =====================================================

cases = []


for query_id, group in ground.groupby(
    "query_id"
):

    query = str(
        group["query"].iloc[0]
    )

    category = str(
        group["category"].iloc[0]
    )

    if not clean_query(query):
        continue

    labels = (
        group["esci_label"]
        .astype(str)
        .str.upper()
    )

    exact_ids = set(
        group[
            labels == "E"
        ]["product_id"].astype(str)
    )

    substitute_ids = set(
        group[
            labels == "S"
        ]["product_id"].astype(str)
    )

    # Only products that remain in
    # our cleaned experimental catalog
    exact_ids = (
        exact_ids
        & catalog_ids
    )

    substitute_ids = (
        substitute_ids
        & catalog_ids
    )

    # We need a clean substitute-only case
    if len(exact_ids) != 1:
        continue

    if len(substitute_ids) == 0:
        continue

    target_id = next(
        iter(exact_ids)
    )

    # Check semantic ranking BEFORE
    # manipulating inventory
    scores = (
        engine._semantic_relevance(
            query
        )
    )

    candidates = (
        engine.products.copy()
    )

    candidates["score"] = scores

    candidates = candidates[
        candidates["category"]
        == category
    ]

    if len(candidates) == 0:
        continue

    best = candidates.sort_values(
        "score",
        ascending=False
    ).iloc[0]

    # Exact target must genuinely be
    # the model's best semantic result
    if str(
        best["product_id"]
    ) != target_id:
        continue

    cases.append({
        "query_id":
            query_id,

        "query":
            query,

        "category":
            category,

        "target_id":
            target_id,

        "target_title":
            best["product_title"],

        "substitute_ids":
            substitute_ids,

        "num_known_substitutes":
            len(substitute_ids)
    })


cases = pd.DataFrame(
    cases
)


print(
    "\nControlled substitute cases:",
    len(cases)
)


if len(cases) == 0:

    print(
        "No suitable substitute cases found."
    )

    raise SystemExit


print("\nCases by category:")

print(
    cases[
        "category"
    ].value_counts()
)


print(
    "\nAverage Amazon-labelled "
    "substitutes per case:"
)

print(
    round(
        cases[
            "num_known_substitutes"
        ].mean(),
        2
    )
)


# =====================================================
# METRICS
# =====================================================

def evaluate_results(
    results,
    substitute_ids
):

    first_substitute_rank = None

    substitute_count = 0

    partner_substitute_count = 0

    for rank, product in enumerate(
        results,
        start=1
    ):

        product_id = str(
            product["product_id"]
        )

        if (
            product_id
            in substitute_ids
        ):

            substitute_count += 1

            if (
                first_substitute_rank
                is None
            ):
                first_substitute_rank = (
                    rank
                )

            if (
                product.get(
                    "source"
                )
                == "partner"
            ):
                partner_substitute_count += 1

    return {
        "substitute_hit":
            int(
                first_substitute_rank
                is not None
            ),

        "substitute_rank":
            first_substitute_rank,

        "substitute_mrr":
            (
                1 /
                first_substitute_rank
                if first_substitute_rank
                else 0
            ),

        "substitute_count":
            substitute_count,

        "partner_substitute_hit":
            int(
                partner_substitute_count
                > 0
            ),

        "partner_substitute_count":
            partner_substitute_count
    }


# =====================================================
# RUN CONTROLLED EXPERIMENT
# =====================================================

rows = []

modes = [
    "baseline",
    "optimized",
    "orchestrated"
]


for number, case in cases.iterrows():

    target_id = str(
        case["target_id"]
    )

    target_rows = engine.products[
        engine.products[
            "product_id"
        ] == target_id
    ]

    if len(target_rows) == 0:
        continue

    target_index = (
        target_rows.index[0]
    )

    # Save original synthetic
    # operational state
    original_internal = (
        engine.products.loc[
            target_index,
            "internal_stock"
        ]
    )

    original_partner = (
        engine.products.loc[
            target_index,
            "partner_available"
        ]
    )

    # -----------------------------------------
    # CONTROLLED COUNTERFACTUAL:
    #
    # exact target unavailable everywhere
    # -----------------------------------------

    engine.products.loc[
        target_index,
        "internal_stock"
    ] = 0

    engine.products.loc[
        target_index,
        "partner_available"
    ] = 0


    for mode in modes:

        start = time.perf_counter()

        response = engine.search(
            query=case["query"],
            mode=mode,
            category=case[
                "category"
            ],
            search_type="specific",
            k=5
        )

        latency_ms = (
            time.perf_counter()
            - start
        ) * 1000

        metrics = evaluate_results(
            response["results"],
            case[
                "substitute_ids"
            ]
        )

        rows.append({
            "query_id":
                case["query_id"],

            "query":
                case["query"],

            "category":
                case["category"],

            "target_id":
                target_id,

            "mode":
                mode,

            "substitute_hit_at_5":
                metrics[
                    "substitute_hit"
                ],

            "substitute_rank":
                metrics[
                    "substitute_rank"
                ],

            "substitute_mrr":
                metrics[
                    "substitute_mrr"
                ],

            "substitute_count":
                metrics[
                    "substitute_count"
                ],

            "partner_substitute_hit":
                metrics[
                    "partner_substitute_hit"
                ],

            "partner_substitute_count":
                metrics[
                    "partner_substitute_count"
                ],

            "orchestration_triggered":
                int(
                    response[
                        "orchestration_triggered"
                    ]
                ),

            "latency_ms":
                latency_ms
        })


    # -----------------------------------------
    # RESTORE original operational state
    # -----------------------------------------

    engine.products.loc[
        target_index,
        "internal_stock"
    ] = original_internal

    engine.products.loc[
        target_index,
        "partner_available"
    ] = original_partner


    if (
        (number + 1) % 20
        == 0
    ):

        print(
            "Completed:",
            number + 1,
            "/",
            len(cases)
        )


results = pd.DataFrame(
    rows
)


# =====================================================
# SUMMARY
# =====================================================

summary = (
    results
    .groupby("mode")
    .agg(
        cases=(
            "query_id",
            "count"
        ),

        substitute_hit_at_5=(
            "substitute_hit_at_5",
            "mean"
        ),

        substitute_mrr=(
            "substitute_mrr",
            "mean"
        ),

        avg_substitutes_in_top5=(
            "substitute_count",
            "mean"
        ),

        partner_substitute_hit_rate=(
            "partner_substitute_hit",
            "mean"
        ),

        avg_partner_substitutes=(
            "partner_substitute_count",
            "mean"
        ),

        trigger_rate=(
            "orchestration_triggered",
            "mean"
        ),

        latency_ms=(
            "latency_ms",
            "mean"
        )
    )
    .reset_index()
)


for column in [
    "substitute_hit_at_5",
    "partner_substitute_hit_rate",
    "trigger_rate"
]:

    summary[column] *= 100


# =====================================================
# CATEGORY SUMMARY
# =====================================================

category_summary = (
    results
    .groupby(
        [
            "category",
            "mode"
        ]
    )
    .agg(
        cases=(
            "query_id",
            "count"
        ),

        substitute_hit_at_5=(
            "substitute_hit_at_5",
            "mean"
        ),

        substitute_mrr=(
            "substitute_mrr",
            "mean"
        ),

        avg_substitutes=(
            "substitute_count",
            "mean"
        ),

        latency_ms=(
            "latency_ms",
            "mean"
        )
    )
    .reset_index()
)


category_summary[
    "substitute_hit_at_5"
] *= 100


# =====================================================
# SAVE
# =====================================================

results.to_csv(
    "data/substitute_benchmark_results.csv",
    index=False
)

summary.to_csv(
    "data/substitute_benchmark_summary.csv",
    index=False
)

category_summary.to_csv(
    "data/substitute_benchmark_by_category.csv",
    index=False
)


# =====================================================
# PRINT
# =====================================================

pd.set_option(
    "display.max_columns",
    None
)

pd.set_option(
    "display.width",
    200
)


print("\n")
print("=" * 100)
print(
    "CONTROLLED SUBSTITUTE-ONLY RESULTS"
)
print("=" * 100)

print(
    summary
    .round(3)
    .to_string(
        index=False
    )
)


print("\n")
print("=" * 100)
print(
    "RESULTS BY CATEGORY"
)
print("=" * 100)

print(
    category_summary
    .round(3)
    .to_string(
        index=False
    )
)


print("\nSaved:")

print(
    "data/substitute_benchmark_results.csv"
)

print(
    "data/substitute_benchmark_summary.csv"
)

print(
    "data/substitute_benchmark_by_category.csv"
)
