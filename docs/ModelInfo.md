# PROJECT HANDOFF CONTEXT
## Adaptive Multi-Agent Orchestration for E-Commerce Stockout Recovery

This file is meant to let another developer — or a fresh ChatGPT conversation — continue this project from the current working state without redoing earlier decisions.

---

# 1. PROJECT GOAL

Current research title:

**Adaptive Multi-Agent Orchestration for Stockout Recovery and Relevance–Diversity-Aware Product Discovery in E-Commerce**

Primary contribution:
- Detect when the best-ranked product is unavailable internally.
- Adaptively choose among:
  - normal internal fulfillment,
  - exact-product recovery through a partner merchant,
  - internal substitutes,
  - partner substitutes.
- Preserve search relevance while improving result diversity.
- Expose an interpretable decision trace showing why orchestration occurred.

Secondary contribution:
- Relevance-diversity-aware ranking for product discovery.

Do NOT make stockout prediction a contribution. The current project focuses on stockout recovery, not forecasting.

Important conceptual point:

**Adaptive does not merely mean “multiple agents.”**
Adaptive means the transaction state determines which action/path is invoked instead of always executing a fixed workflow.

Current architecture is best described as:

**Centralized adaptive orchestration.**

---

# 2. EXPERIMENTAL CONDITIONS

## Baseline
- TF-IDF semantic retrieval.
- Internal inventory only.
- No structured constraint handling.
- No diversity reranking.
- No stockout recovery.

## Optimized
- Semantic relevance.
- Structured query parsing for general searches.
- Relevance-diversity reranking.
- Internal inventory only.
- No stockout recovery.

## Orchestrated
- Same optimized retrieval.
- Detects stockout of the best-ranked candidate.
- Attempts exact-product recovery through simulated partner inventory.
- If exact recovery is unavailable or infeasible, considers internal and partner substitutes.
- Returns an explainable `decision_trace`.

---

# 3. DATASET

Base dataset:

**Amazon Shopping Queries Dataset (ESCI)**

Real dataset elements:
- Search queries.
- Product metadata.
- ESCI relevance relationships:
  - E = Exact
  - S = Substitute
  - C = Complement
  - I = Irrelevant

Operational fields missing from ESCI are generated deterministically for controlled experiments:
- price
- internal stock
- partner availability
- partner price
- delivery days
- partner rating

Correct research wording:

> **Search relevance and product relationships are real; stockout and fulfillment conditions are simulated.**

Do NOT describe synthetic partner availability as real Amazon merchant availability.

---

# 4. LOCAL PROJECT

Main working directory:

```bash
~/daa-ecommerce/model
```

Raw ESCI repository:

```bash
~/daa-ecommerce/esci-data
```

Virtual environment:

```bash
~/daa-ecommerce/model/venv
```

Activate with:

```bash
cd ~/daa-ecommerce/model
source venv/bin/activate
```

---

# 5. CURRENT CLEAN CATALOG

After the latest data cleaning:
- Phone: 369
- Laptop: 319
- Refrigerator: 229
- Watch: 228

Total:

**1,145 products**

Inventory state:
- Internal stock available: 854
- Internal stockout: 291

Among stockouts:
- Partner available: 210
- No partner: 81

These states are deterministic synthetic operational conditions.

---

# 6. IMPORTANT PROJECT FILES

```text
model/
├── api.py
├── search_engine.py
├── evaluator.py
├── prepare_data.py
├── generate_scenarios.py
├── benchmark.py
├── benchmark_stockouts.py
├── benchmark_substitutes.py
├── generate_plots.py
├── test_demo.py
├── requirements.txt
│
├── data/
│   ├── products.csv
│   ├── query_products.csv
│   ├── scenarios.json
│   ├── benchmark_results.csv
│   ├── benchmark_summary.csv
│   ├── benchmark_by_category.csv
│   ├── stockout_benchmark_results.csv
│   ├── stockout_benchmark_summary.csv
│   ├── stockout_partner_summary.csv
│   ├── stockout_no_partner_summary.csv
│   ├── substitute_benchmark_results.csv
│   ├── substitute_benchmark_summary.csv
│   └── substitute_benchmark_by_category.csv
│
└── results/
    ├── search_quality_diversity.png
    ├── latency_comparison.png
    └── stockout_recovery.png
```

`test_demo.py` was intentionally named that instead of `review_demo.py`.



---

# 7. SEARCH ENGINE

`SearchEngine` loads `data/products.csv`.

TF-IDF settings:
- English stop words.
- Up to 30,000 features.
- Unigrams + bigrams.
- Cosine similarity.

---

# 8. QUERY PARSER

For `search_type="general"`, the parser extracts:
- maximum price
- minimum price
- RAM
- storage
- screen size
- color
- brand
- maximum delivery time

Example:

```text
black gaming laptop under 80000 with 16gb ram and 512gb ssd
```

Parses approximately as:

```python
{
    "max_price": 80000,
    "ram_gb": 16,
    "storage_gb": 512,
    "color": "black"
}
```

For `search_type="specific"`, structured constraints are intentionally not used.

---

# 9. RELEVANCE AND CONSTRAINT SCORING

Semantic relevance:
- TF-IDF cosine similarity.

Optimized relevance for general search:
- 70% semantic relevance.
- 30% structured constraint score.

Constraint scoring considers:
- price
- RAM
- storage
- screen size
- color
- brand

Price constraints are hard-filtered in optimized/orchestrated general search.

RAM/storage/color remain mostly soft to allow nearest alternatives.

---

# 10. INTENT-ADAPTIVE MMR

The diversity reranker computes candidate-to-candidate similarity once for efficiency.

Current intent settings:

## Specific search
```python
relevance_weight = 0.98
brand_penalty = 0.01
```

## General search
```python
relevance_weight = 0.90
brand_penalty = 0.04
```

Do NOT casually retune these values. Current benchmark results were produced with these settings.

---

# 11. MODE BEHAVIOR

## Baseline
- Semantic TF-IDF only.
- Category filter.
- Internal inventory only.
- Sort by score.
- No MMR.
- No constraints.
- No partner route.

## Optimized
- Optimized relevance.
- General-query constraints when applicable.
- Hard price filtering.
- Internal inventory only.
- Candidate cutoff.
- Intent-adaptive MMR.

## Orchestrated

```text
Query
  ↓
Rank candidates
  ↓
Best product
  ↓
Is it internally available?
  ├─ Yes → internal fulfillment
  └─ No  → orchestration triggered
              ↓
        Exact partner available
        and constraints pass?
              ├─ Yes → exact partner recovery
              └─ No  → combine feasible:
                         - internal substitutes
                         - partner substitutes
                        then MMR rerank
```

Exact recovered product stays rank #1.

Partner-specific checks include:
- maximum price
- minimum price
- maximum delivery days

---

# 12. DECISION TRACE

`search_engine.py` returns an explainable `decision_trace`.

Possible actions:
- `baseline_internal_retrieval`
- `optimized_internal_retrieval`
- `internal_fulfillment`
- `partner_exact_recovery`
- `substitute_recovery`
- `no_result`

Example:

```json
{
  "best_product_title": "...",
  "internal_available": false,
  "partner_exact_available": true,
  "partner_route_feasible": true,
  "selected_action": "partner_exact_recovery",
  "explanation": [
    "Best-ranked product identified.",
    "Product is unavailable in internal inventory.",
    "Adaptive orchestration was triggered.",
    "Exact product is available through a partner.",
    "Partner constraints passed.",
    "Selected exact-product partner recovery."
  ]
}
```

Use decision trace for:
- faculty demo,
- debugging,
- researcher/admin view.

Do NOT show it to experiment participants because it reveals the experimental condition.

---

# 13. API

Backend:

**FastAPI**

Run:

```bash
cd ~/daa-ecommerce/model
source venv/bin/activate
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Swagger:

```text
http://localhost:8000/docs
```

Endpoints:

```text
GET  /health
GET  /scenarios
POST /search
POST /evaluate
```

## `/health`
Checks backend health and product count.

## `/scenarios`
Returns controlled scenarios from `data/scenarios.json`.

## `/search`

Typical request:

```json
{
  "query": "17 inch gaming laptop",
  "mode": "orchestrated",
  "category": "laptop",
  "search_type": "specific",
  "k": 5
}
```

Allowed modes:
- baseline
- optimized
- orchestrated

Allowed categories:
- phone
- laptop
- watch
- refrigerator

Allowed search types:
- specific
- general

Response includes:
- query
- mode
- search_type
- category
- parsed_constraints
- orchestration_triggered
- decision_trace
- ranked results

## `/evaluate`
Used AFTER retrieval.

Specific evaluation:
- target success
- target rank
- reciprocal rank

General evaluation:
- best constraint match
- best rank
- target success based on constraint match

---

# 14. CRITICAL EXPERIMENT RULE: NO TARGET LEAKAGE

The hidden target must NEVER be sent to `/search`.

Correct workflow:

```text
Frontend privately stores target
        ↓
Participant sees task
        ↓
Participant writes own natural-language query
        ↓
/search
        ↓
Results returned
        ↓
/evaluate receives results + hidden target
```

The target is only used after retrieval.

---

# 15. CONTROLLED SCENARIOS

`data/scenarios.json`

Current count:
- 12 specific scenarios.
- 8 general scenarios.
- 20 total.

For each of 4 categories, specific scenarios include:
1. normal
2. partner_recovery
3. substitute_only

General:
- 2 scenarios per category.

Important:

`reference_query` is ONLY for validation/testing.

It must NOT be prefilled or shown to experiment participants.

Participants should type their own query.

---

# 16. VERIFIED SPECIFIC SCENARIO EXAMPLES

- Phone normal: NUU Mobile G3-64GB/4GB RAM...
- Phone partner recovery: NUU Mobile G3 Plus Unlocked Cell Phone...
- Phone substitute only: NUU Mobile A6L-G...
- Laptop normal: HP High Performance 15.6" Touch-Screen Laptop...
- Laptop partner recovery: 2020 HP Pavilion Newest 14 Inch Laptop...
- Laptop substitute only: Lenovo ThinkPad P52s...
- Watch partner recovery: Amazfit GTS Fitness Smartwatch...
- Refrigerator partner recovery: Midea WHS-87LSS1 Refrigerator...

These were generated and validated by `generate_scenarios.py`.

---

# 17. MAIN BENCHMARK

Run:

```bash
python benchmark.py
```

Current benchmark:

**173 real ESCI queries**

Eligible query counts before balanced sampling:
- phone: 72
- refrigerator: 44
- laptop: 41
- watch: 38

Final benchmark sample:

**173 queries**

Measured results:

| Mode | Hit@5 | MRR | Brand Diversity | Mean Relevance | Avg Latency |
|---|---:|---:|---:|---:|---:|
| Baseline | 42.197% | 0.263 | 64.624% | 0.213 | ~15.3 ms |
| Optimized | 41.040% | 0.262 | 68.574% | 0.216 | ~33.3 ms |
| Orchestrated | 42.197% | 0.274 | 69.335% | 0.220 | ~31.5 ms |

Important interpretation:
- Do NOT claim the contribution is higher raw Hit@5.
- Orchestrated matches baseline Hit@5.
- Orchestrated has the best MRR.
- Orchestrated has higher brand diversity.
- Absolute latency remains low.

Good review wording:

> Across 173 real ESCI queries, the orchestrated system maintained the baseline Hit@5 of approximately 42.2%, while increasing brand diversity from 64.6% to 69.3% and improving MRR from 0.263 to 0.274.

---

# 18. CONTROLLED EXACT-STOCKOUT BENCHMARK

Run:

```bash
python benchmark_stockouts.py
```

Strict inclusion:
1. Real ESCI query.
2. Top semantic result is Amazon-labelled Exact.
3. Product exists in cleaned catalog.
4. Product is internally out of stock.

Current controlled cases:

**9**

By category:
- laptop: 4
- phone: 4
- watch: 1

Partner availability:
- exact partner available: 6
- exact partner unavailable: 3

Current result:

| Mode | Target Recovery | Target MRR | Trigger Rate |
|---|---:|---:|---:|
| Baseline | 0% | 0.000 | 0% |
| Optimized | 0% | 0.000 | 0% |
| Orchestrated | 66.667% | 0.667 | 100% |

For the 6 cases where the exact product exists at a simulated partner:

| Mode | Exact Recovery |
|---|---:|
| Baseline | 0 / 6 |
| Optimized | 0 / 6 |
| Orchestrated | 6 / 6 |

All 6 orchestrated recoveries were rank #1.

Correct wording:

> In the controlled exact-stockout study, the orchestrated system recovered all 6 of 6 exact targets when the simulated partner route was available, with every recovery occurring at rank 1.

Do NOT present this as real-world Amazon partner performance.

Overall recovery across all 9 stockouts = 66.7%.

---

# 19. SUBSTITUTE PILOT

Run:

```bash
python benchmark_substitutes.py
```

Strict eligible cases:

**3 only**

- watch: 2
- laptop: 1

Average Amazon-labelled substitutes per case:

**4.0**

Results:

| Mode | Substitute Hit@5 | Substitute MRR |
|---|---:|---:|
| Baseline | 66.667% | 0.444 |
| Optimized | 66.667% | 0.444 |
| Orchestrated | 66.667% | 0.417 |

No Amazon-labelled substitute in these 3 cases happened to have simulated partner availability.

Interpretation:

This is ONLY a pilot/limitation.

Do NOT use it as a headline result.

Do NOT tune the model just to make this tiny 3-case benchmark look better.

---

# 20. GENERATED FIGURES

Run:

```bash
python generate_plots.py
```

Requires matplotlib.

Generated:

```text
results/search_quality_diversity.png
results/latency_comparison.png
results/stockout_recovery.png
```

Current printed key results:
- Baseline Hit@5: 42.2%
- Orchestrated Hit@5: 42.2%
- Baseline diversity: 64.62%
- Orchestrated diversity: 69.34%
- Orchestrated MRR: 0.274
- Partner-available recovery: 100%

---

# 21. DEMO SCRIPT

Run:

```bash
python test_demo.py
```

This script:
- loads a verified partner-recovery scenario,
- runs baseline,
- runs optimized,
- runs orchestrated,
- shows the target,
- shows whether orchestration triggered,
- shows ranked results,
- shows the decision trace,
- prints benchmark summary.

The demo currently works.

---

# 22. HUMAN WEBSITE EXPERIMENT

The frontend should present two task types.

## Specific Product

Participant sees a target product and writes their own natural-language query.

Frontend privately retains:

```text
target_product_id
```

Do NOT send it to `/search`.

## General Search

Participant sees desired constraints, for example:
- maximum price
- RAM
- storage
- screen size
- color
- brand

Participant writes their own query.

Frontend privately stores:

```text
target_constraints
```

These are used only by `/evaluate` after retrieval.

---

# 23. WEBSITE COMPARISON CONDITIONS

The same participant query should ideally be evaluated under:

1. baseline
2. optimized
3. orchestrated

| Capability | Baseline | Optimized | Orchestrated |
|---|---|---|---|
| Semantic relevance | Yes | Yes | Yes |
| Query constraints | No | Yes | Yes |
| Diversity reranking | No | Yes | Yes |
| Internal stock | Yes | Yes | Yes |
| Exact partner recovery | No | No | Yes |
| Partner/internal substitutes | No | No | Yes |
| Decision trace | No | No | Yes |

Decision trace should be hidden from participants.

---

# 24. HUMAN-EVALUATION LANGUAGE

Use:
- target-product success
- simulated purchase-completion
- recovery success
- stated return intention
- stated repeat-purchase intention
- user satisfaction

Do NOT claim:
- actual conversion
- actual long-term customer retention
- actual repeat purchases

unless a real purchase/longitudinal study exists.

---

# 25. WHAT IS FROZEN / DO NOT CHANGE CASUALLY

Unless a real bug appears, do NOT keep tuning:
- TF-IDF settings
- 70/30 optimized relevance blend
- MMR weights
- candidate thresholds
- synthetic inventory seed logic
- core orchestration path
- main benchmark methodology

Reason:

Current benchmark, plots, scenarios, and demo are aligned with this configuration.

Any change means rerunning and revalidating:

```bash
python generate_scenarios.py
python benchmark.py
python benchmark_stockouts.py
python benchmark_substitutes.py
python generate_plots.py
python test_demo.py
```

---

# 26. WHAT STILL NEEDS TO BE BUILT

Primary remaining work:

## Frontend / website
- scenario loading
- participant task screen
- query box
- result cards
- condition handling
- hidden target storage
- `/evaluate` call
- questionnaire
- experiment result logging

Backend is essentially ready for frontend integration.

Potential later work:
- better substitute-specific evaluation
- larger controlled stockout sample
- human participant study
- experiment logging endpoint / database
- better retrieval model if scientifically justified
- paper results section after human evaluation

Do NOT add extra model complexity just for appearance.

---

# 27. REQUIREMENTS

Minimal dependencies:

```text
fastapi
uvicorn
pandas
numpy
scikit-learn
pydantic
matplotlib
```

If `prepare_data.py` is rerun from parquet files, `pyarrow` is also required.

---

# 28. STARTUP COMMANDS

```bash
cd ~/daa-ecommerce/model
source venv/bin/activate
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Swagger:

```text
http://localhost:8000/docs
```

Useful checks:

```bash
python test_demo.py
python benchmark.py
python benchmark_stockouts.py
```

---

# 29. GIT / HANDOFF GUIDANCE

Do NOT commit:

```text
venv/
__pycache__/
*.pyc
```

Strongly consider excluding the raw cloned ESCI repository from this project repository.

Runtime frontend/backend handoff mainly needs:

```text
api.py
search_engine.py
evaluator.py
data/products.csv
data/scenarios.json
requirements.txt
```

For reproducibility/research work also keep:

```text
prepare_data.py
generate_scenarios.py
benchmark.py
benchmark_stockouts.py
benchmark_substitutes.py
generate_plots.py
test_demo.py
data/query_products.csv
benchmark CSV outputs
result PNGs
```

---

# 30. CURRENT RESEARCH STORY FOR FACULTY

A concise credible explanation:

> We are using real Amazon ESCI queries, products, and human relevance labels as the search ground truth. Because ESCI does not provide inventory and fulfillment data, those operational states are deterministically simulated. We compare a semantic baseline, a constraint-and-diversity optimized search system, and an adaptive orchestration layer that reacts to stockouts. Across 173 real ESCI queries, orchestration preserves baseline Hit@5 while improving diversity and MRR. In a controlled exact-stockout evaluation, it recovered all 6 of 6 exact products for which simulated partner inventory was available, all at rank 1. The next stage is a website-based human evaluation where targets remain hidden from retrieval.

---

# 31. IF THIS FILE IS GIVEN TO CHATGPT

If you are ChatGPT continuing this project:

1. Treat everything above as the current canonical project state.
2. Do not redesign or retune the model without a concrete reason.
3. Prefer incremental changes with exact filenames and paste-ready code.
4. Preserve the no-target-leakage rule.
5. Preserve the distinction between real ESCI relevance data and simulated operational fields.
6. Do not overclaim the 9-case stockout benchmark or 3-case substitute pilot.
7. Immediate engineering priority is frontend integration / experiment logging, not more ranking-model tinkering.
8. The user prefers direct step-by-step instructions and minimal unnecessary changes.
