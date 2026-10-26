import pandas as pd
import re
from search_engine import SearchEngine

engine = SearchEngine()

ground = pd.read_csv("data/query_products.csv")
products = engine.products.copy()

# Make product IDs comparable
ground["product_id"] = ground["product_id"].astype(str)
products["product_id"] = products["product_id"].astype(str)

product_ids = set(products["product_id"])


def clean_query(q):
    q = str(q).strip()

    if len(q) < 5 or len(q) > 100:
        return False

    if len(q.split()) < 2:
        return False

    letters = len(re.findall(r"[A-Za-z]", q))

    if letters / max(len(q), 1) < 0.65:
        return False

    return True


exact = ground[
    ground["esci_label"].astype(str).str.upper() == "E"
].copy()

exact = exact[
    exact["query"].apply(clean_query)
]


for _, row in exact.iterrows():

    query = row["query"]
    category = row["category"]
    exact_id = str(row["product_id"])

    # Exact product must exist in cleaned catalog
    if exact_id not in product_ids:
        continue

    scores = engine._relevance(query)

    candidates = products.copy()
    candidates["score"] = scores

    candidates = candidates[
        candidates["category"] == category
    ]

    if len(candidates) == 0:
        continue

    best = candidates.sort_values(
        "score",
        ascending=False
    ).iloc[0]

    # Model's best result must also be
    # Amazon's Exact-labelled product
    if (
        str(best["product_id"]) == exact_id
        and best["internal_stock"] == 0
        and best["partner_available"] == 1
    ):

        print("\nFOUND RECOVERY CASE")
        print("===================")

        print("Category:", category)
        print("Query:", query)

        print("\nProduct:")
        print(best["product_title"])

        print("\nBrand:")
        print(best["product_brand"])

        print("\nInternal stock:", best["internal_stock"])
        print("Partner available:", best["partner_available"])

        print("Internal price:", best["price"])
        print("Partner price:", best["partner_price"])

        print(
            "Partner delivery:",
            best["partner_delivery_days"],
            "days"
        )

        print(
            "Relevance score:",
            round(float(best["score"]), 4)
        )

        break

else:
    print("No perfect recovery case found.")
