from search_engine import SearchEngine

engine = SearchEngine()

query = "17 gaming laptop"
category = "laptop"

for mode in [
    "baseline",
    "optimized",
    "orchestrated"
]:

    print("\n\n==============================")
    print(mode.upper())
    print("==============================")

    result = engine.search(
        query=query,
        mode=mode,
        category=category,
        k=5
    )

    print(
        "Orchestration triggered:",
        result["orchestration_triggered"]
    )

    for i, product in enumerate(
        result["results"],
        start=1
    ):

        print(
            f"\n{i}. {product['product_title']}"
        )

        print(
            "   Brand:",
            product["product_brand"]
        )

        print(
            "   Source:",
            product["source"]
        )

        print(
            "   Score:",
            round(
                float(product["score"]),
                4
            )
        )

        if "final_price" in product:
            print(
                "   Final price:",
                product["final_price"]
            )