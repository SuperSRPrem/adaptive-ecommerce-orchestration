import os
import pandas as pd
import matplotlib.pyplot as plt


os.makedirs(
    "results",
    exist_ok=True
)


# =====================================================
# LOAD RESULTS
# =====================================================

main = pd.read_csv(
    "data/benchmark_summary.csv"
)

stockout = pd.read_csv(
    "data/stockout_benchmark_summary.csv"
)

partner = pd.read_csv(
    "data/stockout_partner_summary.csv"
)


labels = {
    "baseline": "Baseline",
    "optimized": "Optimized",
    "orchestrated": "Orchestrated"
}

main["label"] = (
    main["mode"].map(labels)
)

stockout["label"] = (
    stockout["mode"].map(labels)
)

partner["label"] = (
    partner["mode"].map(labels)
)


# =====================================================
# FIGURE 1
# SEARCH QUALITY + DIVERSITY
# =====================================================

x = range(len(main))

width = 0.35

fig, ax = plt.subplots(
    figsize=(8, 5)
)

bars1 = ax.bar(
    [i - width / 2 for i in x],
    main["hit_at_5"],
    width,
    label="Hit@5"
)

bars2 = ax.bar(
    [i + width / 2 for i in x],
    main["brand_diversity"],
    width,
    label="Brand Diversity"
)

ax.set_xticks(
    list(x)
)

ax.set_xticklabels(
    main["label"]
)

ax.set_ylabel(
    "Percentage (%)"
)

ax.set_title(
    "Retrieval Accuracy and Result Diversity"
)

ax.legend()

ax.bar_label(
    bars1,
    fmt="%.1f%%",
    padding=3
)

ax.bar_label(
    bars2,
    fmt="%.1f%%",
    padding=3
)

fig.tight_layout()

fig.savefig(
    "results/search_quality_diversity.png",
    dpi=200
)

plt.close(fig)


# =====================================================
# FIGURE 2
# LATENCY
# =====================================================

fig, ax = plt.subplots(
    figsize=(7, 5)
)

bars = ax.bar(
    main["label"],
    main["latency_ms"]
)

ax.set_ylabel(
    "Average latency (ms)"
)

ax.set_title(
    "Average Retrieval Latency"
)

ax.bar_label(
    bars,
    fmt="%.1f ms",
    padding=3
)

fig.tight_layout()

fig.savefig(
    "results/latency_comparison.png",
    dpi=200
)

plt.close(fig)


# =====================================================
# FIGURE 3
# STOCKOUT RECOVERY
# =====================================================

fig, ax = plt.subplots(
    figsize=(8, 5)
)

bars = ax.bar(
    stockout["label"],
    stockout[
        "target_recovery_rate"
    ]
)

ax.set_ylim(
    0,
    110
)

ax.set_ylabel(
    "Exact target recovery (%)"
)

ax.set_title(
    "Controlled Stockout Recovery"
)

ax.bar_label(
    bars,
    fmt="%.1f%%",
    padding=3
)

ax.text(
    2,
    stockout.loc[
        stockout["mode"]
        == "orchestrated",
        "target_recovery_rate"
    ].iloc[0] + 8,
    "6 of 9 stockouts recovered",
    ha="center"
)

fig.tight_layout()

fig.savefig(
    "results/stockout_recovery.png",
    dpi=200
)

plt.close(fig)


# =====================================================
# PRINT REVIEW SUMMARY
# =====================================================

orch = main[
    main["mode"]
    == "orchestrated"
].iloc[0]

base = main[
    main["mode"]
    == "baseline"
].iloc[0]

partner_orch = partner[
    partner["mode"]
    == "orchestrated"
].iloc[0]


print("\nGenerated:")
print(
    "results/search_quality_diversity.png"
)
print(
    "results/latency_comparison.png"
)
print(
    "results/stockout_recovery.png"
)


print("\nKey results:")

print(
    "Baseline Hit@5:",
    round(
        base["hit_at_5"],
        2
    ),
    "%"
)

print(
    "Orchestrated Hit@5:",
    round(
        orch["hit_at_5"],
        2
    ),
    "%"
)

print(
    "Baseline diversity:",
    round(
        base["brand_diversity"],
        2
    ),
    "%"
)

print(
    "Orchestrated diversity:",
    round(
        orch["brand_diversity"],
        2
    ),
    "%"
)

print(
    "Orchestrated MRR:",
    round(
        orch["mrr"],
        3
    )
)

print(
    "Partner-available recovery:",
    round(
        partner_orch[
            "target_recovery_rate"
        ],
        2
    ),
    "%"
)
