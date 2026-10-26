import re
import os
import hashlib
import numpy as np
import pandas as pd

ESCI = "../esci-data/shopping_queries_dataset/"

examples = pd.read_parquet(
    ESCI + "shopping_queries_dataset_examples.parquet"
)

products = pd.read_parquet(
    ESCI + "shopping_queries_dataset_products.parquet"
)

# Keep English US + small ranking dataset
examples = examples[
    (examples["product_locale"] == "us") &
    (examples["small_version"] == 1)
].copy()

products = products[
    products["product_locale"] == "us"
].copy()

# Merge query-product pairs with product metadata
data = examples.merge(
    products,
    on=["product_id", "product_locale"],
    how="left"
)

for col in [
    "query",
    "product_title",
    "product_description",
    "product_bullet_point",
    "product_brand",
    "product_color"
]:
    data[col] = data[col].fillna("").astype(str)


def get_category(query):
    q = query.lower().strip()

    # PHONE
    if re.search(r"\b(phone|smartphone|iphone)\b", q):
        bad = [
            "case", "cover", "charger", "cable",
            "screen protector", "holder", "mount",
            "headphone", "earbud", "adapter",
            "battery", "tripod"
        ]

        if not any(x in q for x in bad):
            return "phone"

    # LAPTOP
    if re.search(r"\b(laptop|macbook)\b", q):
        bad = [
            "bag", "sleeve", "case", "stand",
            "charger", "battery", "keyboard",
            "dock", "mouse", "cooling pad",
            "screen protector"
        ]

        if not any(x in q for x in bad):
            return "laptop"

    # WATCH
    if re.search(r"\b(watch|smartwatch|apple watch)\b", q):
        bad = [
            "band", "strap", "case", "charger",
            "screen protector", "replacement",
            "watch box", "watch holder"
        ]

        if not any(x in q for x in bad):
            return "watch"

    # REFRIGERATOR
    if re.search(r"\b(refrigerator|fridge)\b", q):
        bad = [
            "filter", "shelf", "bulb", "magnet",
            "organizer", "cover", "water line",
            "replacement", "ice maker"
        ]

        if not any(x in q for x in bad):
            return "refrigerator"

    return None


# Assign category from query
data["category"] = data["query"].apply(get_category)

# Remove unwanted queries
data = data[data["category"].notna()].copy()

# Normalize ESCI labels
data["esci_label"] = (
    data["esci_label"]
    .astype(str)
    .str.upper()
)

# Keep only queries that have at least one Exact result
queries_with_exact = (
    data[data["esci_label"] == "E"]["query_id"]
    .unique()
)

data = data[
    data["query_id"].isin(queries_with_exact)
].copy()

print("\nRows by category:")
print(data["category"].value_counts())

print("\nUnique products by category:")
print(
    data.groupby("category")["product_id"]
        .nunique()
        .sort_values(ascending=False)
)

# Only Exact/Substitute products become part of our catalog
catalog_links = data[
    data["esci_label"].isin(["E", "S"])
].copy()

# Assign each product its most common category
product_category = (
    catalog_links.groupby("product_id")["category"]
        .agg(lambda x: x.mode().iloc[0])
        .reset_index()
)

def valid_product(row):
    title = str(row["product_title"]).lower()
    category = row["category"]

    accessory_words = [
        "case", "cover", "charger", "cable",
        "screen protector", "holder", "mount",
        "strap", "band", "adapter", "sleeve",
        "stand", "replacement", "keyboard",
        "mouse", "headphone", "earbud"
    ]

    if any(x in title for x in accessory_words):
        return False

    if category == "phone":

        bad_phone_products = [
            "inflatable",
            "party decoration",
            "prop",
            "toy",
            "dummy",
            "fake phone",
            "phone case",
            "phone cover",
            "charger",
            "cable",
            "holder",
            "mount",
            "screen protector",
            "adapter"
        ]

        if any(x in title for x in bad_phone_products):
            return False

        phone_words = [
            "iphone",
            "smartphone",
            "cell phone",
            "mobile phone"
        ]

        hardware_words = [
            "android",
            "unlocked",
            "gb ram",
            "gb storage",
            "gb memory",
            "mah",
            "lte",
            "5g",
            "4g",
            "dual sim",
            "single sim"
        ]

        return (
            any(x in title for x in phone_words)
            and
            any(x in title for x in hardware_words)
        )

    if category == "laptop":

        bad = [
            "desk", "lap desk", "tray", "table",
            "stand", "holder", "bag", "sleeve",
            "case", "charger", "battery",
            "replacement", "dock", "docking station",
            "cooling pad", "hard drive",
            "solid state drive", "ssd internal",
            "keyboard", "mouse"
        ]

        if any(x in title for x in bad):
            return False

        laptop_words = [
            "laptop", "notebook",
            "macbook", "chromebook"
        ]

        hardware_words = [
            "intel", "amd", "ryzen",
            "core i3", "core i5", "core i7", "core i9",
            "ram", "ssd", "windows",
            "nvidia", "geforce",
            "gb memory", "gb ram"
        ]

        return (
            any(x in title for x in laptop_words)
            and
            any(x in title for x in hardware_words)
        )

    if category == "watch":
        return (
            "smartwatch" in title or
            "smart watch" in title or
            "apple watch" in title
        )

    if category == "refrigerator":
        return (
            "refrigerator" in title or
            "fridge" in title
        )

    return False

# Build product catalog
selected_products = (
    products.merge(
        product_category,
        on="product_id",
        how="inner"
    )
    .drop_duplicates("product_id")
    .copy()
)

selected_products = selected_products[
    selected_products.apply(valid_product, axis=1)
].copy()

print("\nClean catalog:")
print(
    selected_products["category"]
    .value_counts()
)

# Text used by retrieval model
selected_products["product_text"] = (
    selected_products["product_title"].fillna("").astype(str) + " " +
    selected_products["product_brand"].fillna("").astype(str) + " " +
    selected_products["product_color"].fillna("").astype(str) + " " +
    selected_products["product_bullet_point"].fillna("").astype(str) + " " +
    selected_products["product_description"].fillna("").astype(str)
)

# Synthetic operational price ranges
price_ranges = {
    "phone": (8000, 100000),
    "laptop": (25000, 150000),
    "watch": (2000, 60000),
    "refrigerator": (10000, 120000)
}


def stable_random(product_id):
    h = hashlib.md5(
        str(product_id).encode()
    ).hexdigest()

    return int(h[:8], 16)


def add_operations(row):
    seed = stable_random(
        row["product_id"]
    )

    rng = np.random.default_rng(seed)

    low, high = price_ranges[
        row["category"]
    ]

    price = int(
        rng.integers(
            low,
            high + 1
        )
    )

    # 25% unavailable internally
    internal_stock = int(
        rng.random() > 0.25
    )

    # Partner useful mainly during stockout
    if internal_stock == 0:
        partner_available = int(
            rng.random() < 0.70
        )
    else:
        partner_available = int(
            rng.random() < 0.25
        )

    partner_price = int(
        price *
        rng.uniform(
            0.95,
            1.12
        )
    )

    partner_delivery_days = int(
        rng.integers(
            1,
            8
        )
    )

    partner_rating = round(
        float(
            rng.uniform(
                3.8,
                5.0
            )
        ),
        1
    )

    return pd.Series({
        "price": price,
        "internal_stock": internal_stock,
        "partner_available": partner_available,
        "partner_price": partner_price,
        "partner_delivery_days": partner_delivery_days,
        "partner_rating": partner_rating
    })


# Add synthetic stock/partner attributes
operations = selected_products.apply(
    add_operations,
    axis=1
)

selected_products = pd.concat(
    [
        selected_products,
        operations
    ],
    axis=1
)

os.makedirs(
    "data",
    exist_ok=True
)

# Save final product catalog
selected_products.to_csv(
    "data/products.csv",
    index=False
)

# Save query-product ground truth
data.to_csv(
    "data/query_products.csv",
    index=False
)

print("\nSaved:")
print(
    "data/products.csv:",
    len(selected_products)
)

print(
    "data/query_products.csv:",
    len(data)
)

print("\nInternal stock:")
print(
    selected_products[
        "internal_stock"
    ].value_counts()
)

print(
    "\nPartner availability for stockouts:"
)

print(
    selected_products[
        selected_products[
            "internal_stock"
        ] == 0
    ]["partner_available"]
    .value_counts()
)