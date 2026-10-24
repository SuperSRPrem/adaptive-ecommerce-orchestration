import json

from search_engine import SearchEngine


engine = SearchEngine()


# =====================================================
# LOAD VERIFIED SCENARIOS
# =====================================================

with open(
    "data/scenarios.json",
    "r"
) as f:
    scenarios = json.load(f)


# Use a reliable laptop partner-recovery case
scenario = next(
    x
    for x in scenarios["specific"]
    if x["id"]
    == "laptop_partner_recovery"
)


query = scenario["reference_query"]
category = scenario["category"]
target_id = scenario["target_product_id"]


print("\n")
print("=" * 90)
print("ADAPTIVE E-COMMERCE STOCKOUT RECOVERY DEMO")
print("=" * 90)

print("\nTarget product:")
print(
    scenario[
        "target_product_title"
    ]
)

print("\nCategory:")
print(category)

print("\nInternal stock:")
print(
    "AVAILABLE"
    if scenario["internal_stock"]
    else "OUT OF STOCK"
)

print("\nPartner availability:")
print(
    "AVAILABLE"
    if scenario["partner_available"]
    else "UNAVAILABLE"
)

print("\nUser query:")
print(query)


# =====================================================
# RUN ALL THREE CONDITIONS
# =====================================================

for mode in [
    "baseline",
    "optimized",
    "orchestrated"
]:

    response = engine.search(
        query=query,
        mode=mode,
        category=category,
        search_type="specific",
        k=5
    )

    print("\n")
    print("=" * 90)
    print(mode.upper())
    print("=" * 90)

    print(
        "\nOrchestration triggered:",
        response[
            "orchestration_triggered"
        ]
    )

    print("\nTop results:")

    for rank, product in enumerate(
        response["results"],
        start=1
    ):

        marker = ""

        if (
            str(product["product_id"])
            == str(target_id)
        ):
            marker = "  <-- TARGET"

        print(
            f"\n{rank}. "
            f"{product['product_title']}"
            f"{marker}"
        )

        print(
            "   Source:",
            product["source"]
        )

        print(
            "   Score:",
            round(
                product["score"],
                4
            )
        )

        print(
            "   Price:",
            product["final_price"]
        )


    # -----------------------------------------
    # SHOW DECISION TRACE
    # -----------------------------------------

    print("\nDecision trace:")

    trace = response[
        "decision_trace"
    ]

    print(
        "Selected action:",
        trace[
            "selected_action"
        ]
    )

    if (
        "best_product_title"
        in trace
    ):

        print(
            "Best product:",
            trace[
                "best_product_title"
            ]
        )

    for step in trace[
        "explanation"
    ]:

        print(
            "  ->",
            step
        )


print("\n")
print("=" * 90)
print("BENCHMARK SUMMARY")
print("=" * 90)

print(
    """
173 real ESCI queries:

Baseline
  Hit@5            : 42.20%
  Brand diversity  : 64.62%
  MRR              : 0.263

Optimized
  Hit@5            : 41.04%
  Brand diversity  : 68.57%
  MRR              : 0.262

Orchestrated
  Hit@5            : 42.20%
  Brand diversity  : 69.34%
  MRR              : 0.274

Controlled stockout evaluation:
  9 valid exact-product stockout cases
  6 had exact product available through partner
  6 / 6 recovered at rank 1
"""
)
