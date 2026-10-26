from search_engine import SearchEngine

engine = SearchEngine()

query = (
    "black gaming laptop under 80000 "
    "with 16gb ram and 512gb ssd"
)

for mode in [
    "baseline",
    "optimized",
    "orchestrated"
]:

    result = engine.search(
        query=query,
        mode=mode,
        category="laptop",
        search_type="general",
        k=5
    )

    print("\n\n==============================")
    print(mode.upper())
    print("==============================")

    print(
        "Parsed:",
        result["parsed_constraints"]
    )

    print(
        "Triggered:",
        result["orchestration_triggered"]
    )

    for i, p in enumerate(
        result["results"],
        1
    ):

        print(
            f"\n{i}. {p['product_title']}"
        )

        print(
            "   Source:",
            p["source"]
        )

        print(
            "   Price:",
            p["final_price"]
        )

        print(
            "   Constraint match:",
            round(
                float(
                    p["constraint_match"]
                ) * 100,
                1
            ),
            "%"
        )
