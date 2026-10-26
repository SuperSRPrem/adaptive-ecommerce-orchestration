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

products = engine.products.copy()

products["product_id"] = (
    products["product_id"].astype(str)
)

catalog_ids = set(
    products["product_id"]
)


# =====================================================
# QUERY CLEANING
# =====================================================

def clean_query(query):

    query = str(query).strip()

    if len(query) < 5:
        return False

    if len(query) > 100:
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
# BUILD ELIGIBLE QUERY SET
# =====================================================

queries = []

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

    exact_ids = set(
        group[
            group["esci_label"]
            .astype(str)
            .str.upper()
            == "E"
        ]["product_id"].astype(str)
    )

    # At least one Amazon Exact product
    # must exist in our cleaned catalog
    exact_ids = (
        exact_ids
        & catalog_ids
    )

    if not exact_ids:
        continue

    queries.append({
        "query_id": query_id,
        "query": query,
        "category": category,
        "exact_ids": exact_ids
    })


queries = pd.DataFrame(
    queries
)

print(
    "\nEligible queries:",
    len(queries)
)

print("\nEligible by category:")

print(
    queries[
        "category"
    ].value_counts()
)


# =====================================================
# BALANCED DETERMINISTIC SAMPLE
# =====================================================

sample_parts = []

for category in [
    "phone",
    "laptop",
    "watch",
    "refrigerator"
]:

    subset = queries[
        queries["category"]
        == category
    ]

    n = min(
        50,
        len(subset)
    )

    if n == 0:
        continue

    sample_parts.append(
        subset.sample(
            n=n,
            random_state=42
        )
    )


sample = pd.concat(
    sample_parts,
    ignore_index=True
)

print(
    "\nBenchmark queries:",
    len(sample)
)


# =====================================================
# METRICS
# =====================================================

def evaluate_results(
    results,
    exact_ids
):

    hit = 0
    reciprocal_rank = 0
    exact_rank = None
    partner_exact = 0

    brands = []

    relevance = []

    for rank, product in enumerate(
        results,
        start=1
    ):

        product_id = str(
            product["product_id"]
        )

        brand = str(
            product.get(
                "product_brand",
                ""
            )
        ).strip().lower()

        if brand:
            brands.append(
                brand
            )

        relevance.append(
            float(
                product.get(
                    "score",
                    0
                )
            )
        )

        if (
            product_id in exact_ids
            and exact_rank is None
        ):

            exact_rank = rank
            hit = 1

            reciprocal_rank = (
                1 / rank
            )

            if (
                product.get(
                    "source"
                )
                == "partner"
            ):
                partner_exact = 1

    unique_brands = len(
        set(brands)
    )

    brand_diversity = (
        unique_brands
        / len(results)
        if results
        else 0
    )

    mean_relevance = (
        sum(relevance)
        / len(relevance)
        if relevance
        else 0
    )

    return {
        "hit_at_5": hit,
        "exact_rank": exact_rank,
        "reciprocal_rank":
            reciprocal_rank,
        "unique_brands":
            unique_brands,
        "brand_diversity":
            brand_diversity,
        "mean_relevance":
            mean_relevance,
        "partner_exact":
            partner_exact
    }


# =====================================================
# RUN BENCHMARK
# =====================================================

rows = []

modes = [
    "baseline",
    "optimized",
    "orchestrated"
]


for number, item in sample.iterrows():

    query = item["query"]
    category = item["category"]
    exact_ids = item["exact_ids"]

    for mode in modes:

        start = time.perf_counter()

        response = engine.search(
            query=query,
            mode=mode,
            category=category,
            search_type="specific",
            k=5
        )

        latency_ms = (
            time.perf_counter()
            - start
        ) * 1000

        metrics = evaluate_results(
            response["results"],
            exact_ids
        )

        rows.append({
            "query_id":
                item["query_id"],

            "query":
                query,

            "category":
                category,

            "mode":
                mode,

            "hit_at_5":
                metrics[
                    "hit_at_5"
                ],

            "exact_rank":
                metrics[
                    "exact_rank"
                ],

            "reciprocal_rank":
                metrics[
                    "reciprocal_rank"
                ],

            "unique_brands":
                metrics[
                    "unique_brands"
                ],

            "brand_diversity":
                metrics[
                    "brand_diversity"
                ],

            "mean_relevance":
                metrics[
                    "mean_relevance"
                ],

            "latency_ms":
                latency_ms,

            "orchestration_triggered":
                int(
                    response[
                        "orchestration_triggered"
                    ]
                ),

            "partner_exact":
                metrics[
                    "partner_exact"
                ]
        })

    if (
        (number + 1) % 20 == 0
    ):
        print(
            "Completed:",
            number + 1,
            "/",
            len(sample)
        )


results = pd.DataFrame(
    rows
)

results.to_csv(
    "data/benchmark_results.csv",
    index=False
)


# =====================================================
# OVERALL SUMMARY
# =====================================================

summary = (
    results
    .groupby("mode")
    .agg(
        queries=(
            "query_id",
            "count"
        ),

        hit_at_5=(
            "hit_at_5",
            "mean"
        ),

        mrr=(
            "reciprocal_rank",
            "mean"
        ),

        brand_diversity=(
            "brand_diversity",
            "mean"
        ),

        unique_brands=(
            "unique_brands",
            "mean"
        ),

        mean_relevance=(
            "mean_relevance",
            "mean"
        ),

        latency_ms=(
            "latency_ms",
            "mean"
        ),

        trigger_rate=(
            "orchestration_triggered",
            "mean"
        ),

        partner_exact_rate=(
            "partner_exact",
            "mean"
        )
    )
    .reset_index()
)


# Convert proportions to %
for column in [
    "hit_at_5",
    "brand_diversity",
    "trigger_rate",
    "partner_exact_rate"
]:

    summary[column] = (
        summary[column]
        * 100
    )


summary.to_csv(
    "data/benchmark_summary.csv",
    index=False
)


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
        hit_at_5=(
            "hit_at_5",
            "mean"
        ),

        mrr=(
            "reciprocal_rank",
            "mean"
        ),

        brand_diversity=(
            "brand_diversity",
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
    "hit_at_5",
    "brand_diversity"
]:

    category_summary[column] *= 100


category_summary.to_csv(
    "data/benchmark_by_category.csv",
    index=False
)


# =====================================================
# RECOVERY SUMMARY
# =====================================================

orchestrated = results[
    results["mode"]
    == "orchestrated"
]

triggered = orchestrated[
    orchestrated[
        "orchestration_triggered"
    ] == 1
]

if len(triggered):

    recovery_rate = (
        triggered[
            "hit_at_5"
        ].mean()
        * 100
    )

    partner_recovery_rate = (
        triggered[
            "partner_exact"
        ].mean()
        * 100
    )

else:

    recovery_rate = 0
    partner_recovery_rate = 0


# =====================================================
# PRINT RESULTS
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
print("=" * 90)
print("OVERALL RESULTS")
print("=" * 90)

print(
    summary.round(3)
    .to_string(
        index=False
    )
)


print("\n")
print("=" * 90)
print("RESULTS BY CATEGORY")
print("=" * 90)

print(
    category_summary
    .round(3)
    .to_string(
        index=False
    )
)


print("\n")
print("=" * 90)
print("STOCKOUT RECOVERY")
print("=" * 90)

print(
    "Triggered cases:",
    len(triggered)
)

print(
    "Exact Hit@5 after trigger:",
    round(
        recovery_rate,
        2
    ),
    "%"
)

print(
    "Exact product recovered "
    "through partner:",
    round(
        partner_recovery_rate,
        2
    ),
    "%"
)


print("\nSaved:")

print(
    "data/benchmark_results.csv"
)

print(
    "data/benchmark_summary.csv"
)

print(
    "data/benchmark_by_category.csv"
)
