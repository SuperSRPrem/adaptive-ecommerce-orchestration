import csv
import io
import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "data", "experiments.db")


class ExperimentStore:
    """SQLite-backed persistence store for human-evaluation experiment sessions, tasks, and questionnaires."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            self.db_path = DEFAULT_DB_PATH
        elif not os.path.isabs(db_path):
            if not os.path.exists(os.path.dirname(db_path)) and not os.path.exists(db_path):
                self.db_path = os.path.join(BASE_DIR, db_path)
            else:
                self.db_path = db_path
        else:
            self.db_path = db_path

        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS experiment_sessions (
                    session_id TEXT PRIMARY KEY,
                    consent_given INTEGER NOT NULL DEFAULT 0,
                    started_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    completed_at TEXT,
                    status TEXT NOT NULL DEFAULT 'in_progress',
                    tasks_completed INTEGER NOT NULL DEFAULT 0
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS experiment_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    task_number INTEGER NOT NULL,
                    scenario_id TEXT NOT NULL,
                    search_type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    query TEXT NOT NULL,
                    hidden_target_json TEXT NOT NULL,
                    assignment_json TEXT NOT NULL,
                    baseline_results_json TEXT NOT NULL,
                    optimized_results_json TEXT NOT NULL,
                    orchestrated_results_json TEXT NOT NULL,
                    baseline_eval_json TEXT NOT NULL,
                    optimized_eval_json TEXT NOT NULL,
                    orchestrated_eval_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS experiment_submissions (
                    submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL UNIQUE,
                    search_type TEXT NOT NULL,
                    scenario_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    query TEXT NOT NULL,
                    hidden_target_json TEXT NOT NULL,
                    assignment_json TEXT NOT NULL,
                    results_summary_json TEXT NOT NULL,
                    evaluations_json TEXT NOT NULL,
                    all_tasks_json TEXT NOT NULL,
                    overall_satisfaction INTEGER NOT NULL,
                    perceived_relevance INTEGER NOT NULL,
                    ease_of_finding INTEGER NOT NULL,
                    perceived_usefulness INTEGER NOT NULL,
                    perceived_diversity INTEGER NOT NULL,
                    product_confidence INTEGER NOT NULL,
                    purchase_intention INTEGER NOT NULL,
                    return_intention INTEGER NOT NULL,
                    repeat_purchase_intention INTEGER NOT NULL,
                    target_retrieval_outcome TEXT NOT NULL,
                    preferred_condition TEXT NOT NULL,
                    condition_ratings_json TEXT NOT NULL,
                    comments TEXT,
                    submitted_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def upsert_session(
        self,
        session_id: str,
        consent_given: bool = True,
        status: str = "in_progress",
    ) -> Dict[str, Any]:
        now = self._now_iso()
        with self._connect() as conn:
            existing = conn.execute(
                "SELECT * FROM experiment_sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()

            if existing is None:
                conn.execute(
                    """
                    INSERT INTO experiment_sessions (
                        session_id, consent_given, started_at, updated_at, completed_at, status, tasks_completed
                    ) VALUES (?, ?, ?, ?, ?, ?, 0)
                    """,
                    (
                        session_id,
                        1 if consent_given else 0,
                        now,
                        now,
                        now if status == "completed" else None,
                        status,
                    ),
                )
            else:
                completed_at = existing["completed_at"] or (
                    now if status == "completed" else None
                )
                next_status = (
                    "completed"
                    if existing["status"] == "completed" or status == "completed"
                    else status
                )
                conn.execute(
                    """
                    UPDATE experiment_sessions
                    SET consent_given = ?, updated_at = ?, completed_at = ?, status = ?
                    WHERE session_id = ?
                    """,
                    (
                        1 if (consent_given or existing["consent_given"]) else 0,
                        now,
                        completed_at,
                        next_status,
                        session_id,
                    ),
                )
            conn.commit()

        return {
            "session_id": session_id,
            "consent_given": consent_given,
            "status": status,
            "updated_at": now,
        }

    def record_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = self._now_iso()
        session_id = str(payload["session_id"])
        self.upsert_session(session_id=session_id, consent_given=True)

        results_by_mode = payload.get("results_by_mode", {})
        evaluations_by_mode = payload.get("evaluations_by_mode", {})

        def compact_results(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            compact = []
            for rank_idx, item in enumerate(items or [], start=1):
                compact.append(
                    {
                        "rank": item.get("rank", rank_idx),
                        "product_id": item.get("product_id"),
                        "product_title": item.get("product_title"),
                        "product_brand": item.get("product_brand"),
                        "source": item.get("source"),
                        "final_price": item.get("final_price", item.get("price")),
                        "score": item.get("score"),
                        "constraint_match": item.get("constraint_match"),
                    }
                )
            return compact

        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO experiment_tasks (
                    session_id,
                    task_number,
                    scenario_id,
                    search_type,
                    category,
                    query,
                    hidden_target_json,
                    assignment_json,
                    baseline_results_json,
                    optimized_results_json,
                    orchestrated_results_json,
                    baseline_eval_json,
                    optimized_eval_json,
                    orchestrated_eval_json,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    int(payload.get("task_number", 1)),
                    str(payload["scenario_id"]),
                    str(payload["search_type"]),
                    str(payload["category"]),
                    str(payload["query"]),
                    json.dumps(payload.get("hidden_target", {})),
                    json.dumps(payload.get("assignment", {})),
                    json.dumps(compact_results(results_by_mode.get("baseline", []))),
                    json.dumps(compact_results(results_by_mode.get("optimized", []))),
                    json.dumps(compact_results(results_by_mode.get("orchestrated", []))),
                    json.dumps(evaluations_by_mode.get("baseline", {})),
                    json.dumps(evaluations_by_mode.get("optimized", {})),
                    json.dumps(evaluations_by_mode.get("orchestrated", {})),
                    now,
                ),
            )
            task_id = cursor.lastrowid

            task_count = conn.execute(
                "SELECT COUNT(*) AS cnt FROM experiment_tasks WHERE session_id = ?",
                (session_id,),
            ).fetchone()["cnt"]

            conn.execute(
                """
                UPDATE experiment_sessions
                SET tasks_completed = ?, updated_at = ?
                WHERE session_id = ?
                """,
                (task_count, now, session_id),
            )
            conn.commit()

        return {
            "status": "task_logged",
            "task_id": task_id,
            "session_id": session_id,
            "recorded_at": now,
        }

    def record_submission(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = self._now_iso()
        session_id = str(payload["session_id"])

        with self._connect() as conn:
            existing = conn.execute(
                "SELECT submission_id, submitted_at FROM experiment_submissions WHERE session_id = ?",
                (session_id,),
            ).fetchone()
            if existing is not None:
                raise ValueError(
                    f"Duplicate submission: Session {session_id} was already submitted at {existing['submitted_at']}."
                )

            q = payload["questionnaire"]
            cursor = conn.execute(
                """
                INSERT INTO experiment_submissions (
                    session_id,
                    search_type,
                    scenario_id,
                    category,
                    query,
                    hidden_target_json,
                    assignment_json,
                    results_summary_json,
                    evaluations_json,
                    all_tasks_json,
                    overall_satisfaction,
                    perceived_relevance,
                    ease_of_finding,
                    perceived_usefulness,
                    perceived_diversity,
                    product_confidence,
                    purchase_intention,
                    return_intention,
                    repeat_purchase_intention,
                    target_retrieval_outcome,
                    preferred_condition,
                    condition_ratings_json,
                    comments,
                    submitted_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    str(payload["search_type"]),
                    str(payload["scenario_id"]),
                    str(payload["category"]),
                    str(payload["query"]),
                    json.dumps(payload.get("hidden_target", {})),
                    json.dumps(payload.get("assignment", {})),
                    json.dumps(payload.get("results_summary", {})),
                    json.dumps(payload.get("evaluations", {})),
                    json.dumps(payload.get("tasks_log", [])),
                    int(q["overall_satisfaction"]),
                    int(q["perceived_relevance"]),
                    int(q["ease_of_finding"]),
                    int(q["perceived_usefulness"]),
                    int(q["perceived_diversity"]),
                    int(q["product_confidence"]),
                    int(q["purchase_intention"]),
                    int(q["return_intention"]),
                    int(q["repeat_purchase_intention"]),
                    str(q["target_retrieval_outcome"]),
                    str(q["preferred_condition"]),
                    json.dumps(q.get("condition_ratings", {})),
                    str(q.get("comments", "") or ""),
                    now,
                ),
            )
            submission_id = cursor.lastrowid

            conn.execute(
                """
                INSERT INTO experiment_sessions (
                    session_id, consent_given, started_at, updated_at, completed_at, status, tasks_completed
                ) VALUES (?, 1, ?, ?, ?, 'completed', ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    consent_given = 1,
                    updated_at = excluded.updated_at,
                    completed_at = excluded.completed_at,
                    status = 'completed',
                    tasks_completed = MAX(experiment_sessions.tasks_completed, excluded.tasks_completed)
                """,
                (
                    session_id,
                    now,
                    now,
                    now,
                    max(1, len(payload.get("tasks_log", []))),
                ),
            )
            conn.commit()

        return {
            "status": "recorded",
            "submission_id": submission_id,
            "session_id": session_id,
            "recorded_at": now,
        }

    def get_summary(self) -> Dict[str, Any]:
        with self._connect() as conn:
            sessions = conn.execute("SELECT * FROM experiment_sessions").fetchall()
            tasks = conn.execute("SELECT * FROM experiment_tasks").fetchall()
            submissions = conn.execute(
                "SELECT * FROM experiment_submissions ORDER BY submission_id DESC"
            ).fetchall()

        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions if s["status"] == "completed")
        incomplete_sessions = total_sessions - completed_sessions

        likert_keys = [
            "overall_satisfaction",
            "perceived_relevance",
            "ease_of_finding",
            "perceived_usefulness",
            "perceived_diversity",
            "product_confidence",
            "purchase_intention",
            "return_intention",
            "repeat_purchase_intention",
        ]
        questionnaire_means: Dict[str, Optional[float]] = {}
        for key in likert_keys:
            if submissions:
                vals = [float(sub[key]) for sub in submissions if sub[key] is not None]
                questionnaire_means[key] = round(sum(vals) / len(vals), 2) if vals else None
            else:
                questionnaire_means[key] = None

        preferred_counts = {
            "baseline": 0,
            "optimized": 0,
            "orchestrated": 0,
            "no_preference": 0,
        }
        retrieval_outcome_counts = {
            "exact": 0,
            "alternative": 0,
            "none": 0,
        }

        condition_rating_sums: Dict[str, Dict[str, List[float]]] = {
            "baseline": {},
            "optimized": {},
            "orchestrated": {},
        }

        for sub in submissions:
            pref = sub["preferred_condition"]
            if pref in preferred_counts:
                preferred_counts[pref] += 1
            else:
                preferred_counts["no_preference"] += 1

            outcome = sub["target_retrieval_outcome"]
            if outcome in retrieval_outcome_counts:
                retrieval_outcome_counts[outcome] += 1

            try:
                c_ratings = json.loads(sub["condition_ratings_json"] or "{}")
                for mode in ("baseline", "optimized", "orchestrated"):
                    m_obj = c_ratings.get(mode, {})
                    for m_key, m_val in m_obj.items():
                        if isinstance(m_val, (int, float)):
                            condition_rating_sums[mode].setdefault(m_key, []).append(float(m_val))
            except Exception:
                pass

        condition_rating_means: Dict[str, Dict[str, Optional[float]]] = {}
        for mode, metrics_dict in condition_rating_sums.items():
            condition_rating_means[mode] = {
                m_key: round(sum(vals) / len(vals), 2) if vals else None
                for m_key, vals in metrics_dict.items()
            }

        # Aggregate condition-wise evaluation metrics across logged tasks (or submissions if tasks table empty)
        eval_records = []
        if tasks:
            for t in tasks:
                eval_records.append(
                    {
                        "search_type": t["search_type"],
                        "baseline": json.loads(t["baseline_eval_json"] or "{}"),
                        "optimized": json.loads(t["optimized_eval_json"] or "{}"),
                        "orchestrated": json.loads(t["orchestrated_eval_json"] or "{}"),
                    }
                )
        else:
            for sub in submissions:
                eval_obj = json.loads(sub["evaluations_json"] or "{}")
                if eval_obj:
                    eval_records.append(
                        {
                            "search_type": sub["search_type"],
                            "baseline": eval_obj.get("baseline", {}),
                            "optimized": eval_obj.get("optimized", {}),
                            "orchestrated": eval_obj.get("orchestrated", {}),
                        }
                    )

        condition_eval_summary: Dict[str, Dict[str, Any]] = {}
        for mode in ("baseline", "optimized", "orchestrated"):
            success_vals = []
            mrr_vals = []
            constraint_match_vals = []

            for rec in eval_records:
                m_eval = rec.get(mode, {})
                if not m_eval:
                    continue
                if "target_success" in m_eval:
                    success_vals.append(100.0 if m_eval["target_success"] else 0.0)
                if rec["search_type"] == "specific" and "reciprocal_rank" in m_eval:
                    mrr_vals.append(float(m_eval["reciprocal_rank"]))
                if rec["search_type"] == "general" and "best_match_percent" in m_eval:
                    constraint_match_vals.append(float(m_eval["best_match_percent"]))

            condition_eval_summary[mode] = {
                "evaluated_tasks": len(eval_records),
                "target_success_rate": round(sum(success_vals) / len(success_vals), 1)
                if success_vals
                else None,
                "mean_reciprocal_rank": round(sum(mrr_vals) / len(mrr_vals), 3)
                if mrr_vals
                else None,
                "mean_constraint_match_percent": round(
                    sum(constraint_match_vals) / len(constraint_match_vals), 1
                )
                if constraint_match_vals
                else None,
            }

        recent_submissions = []
        for sub in submissions[:25]:
            recent_submissions.append(
                {
                    "submission_id": sub["submission_id"],
                    "session_id": sub["session_id"],
                    "search_type": sub["search_type"],
                    "scenario_id": sub["scenario_id"],
                    "category": sub["category"],
                    "query": sub["query"],
                    "preferred_condition": sub["preferred_condition"],
                    "target_retrieval_outcome": sub["target_retrieval_outcome"],
                    "overall_satisfaction": sub["overall_satisfaction"],
                    "perceived_relevance": sub["perceived_relevance"],
                    "submitted_at": sub["submitted_at"],
                }
            )

        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "incomplete_sessions": incomplete_sessions,
            "total_tasks_logged": len(tasks),
            "total_submissions": len(submissions),
            "questionnaire_means": questionnaire_means,
            "preferred_condition_counts": preferred_counts,
            "retrieval_outcome_counts": retrieval_outcome_counts,
            "condition_rating_means": condition_rating_means,
            "condition_evaluation_summary": condition_eval_summary,
            "recent_submissions": recent_submissions,
        }

    def export_csv(self) -> str:
        with self._connect() as conn:
            submissions = conn.execute(
                "SELECT * FROM experiment_submissions ORDER BY submission_id ASC"
            ).fetchall()

        output = io.StringIO()
        writer = csv.writer(output)

        headers = [
            "submission_id",
            "session_id",
            "submitted_at",
            "task_origin",
            "search_type",
            "scenario_id",
            "category",
            "participant_query",
            "hidden_target",
            "baseline_target_success",
            "baseline_rank_or_best_rank",
            "baseline_mrr_or_match_pct",
            "baseline_top_product_ids",
            "optimized_target_success",
            "optimized_rank_or_best_rank",
            "optimized_mrr_or_match_pct",
            "optimized_top_product_ids",
            "orchestrated_target_success",
            "orchestrated_rank_or_best_rank",
            "orchestrated_mrr_or_match_pct",
            "orchestrated_top_product_ids",
            "overall_satisfaction",
            "perceived_relevance",
            "ease_of_finding",
            "perceived_usefulness",
            "perceived_diversity",
            "product_confidence",
            "purchase_intention",
            "return_intention",
            "repeat_purchase_intention",
            "target_retrieval_outcome",
            "preferred_condition",
            "baseline_condition_satisfaction",
            "optimized_condition_satisfaction",
            "orchestrated_condition_satisfaction",
            "comments",
        ]
        writer.writerow(headers)

        for sub in submissions:
            evals = json.loads(sub["evaluations_json"] or "{}")
            results_summary = json.loads(sub["results_summary_json"] or "{}")
            cond_ratings = json.loads(sub["condition_ratings_json"] or "{}")

            def extract_eval_cols(mode: str):
                m_eval = evals.get(mode, {})
                m_res = results_summary.get(mode, [])
                top_ids = "|".join(
                    str(item.get("product_id", "")) for item in m_res[:5] if item.get("product_id")
                )
                success = m_eval.get("target_success")
                rank = m_eval.get("target_rank", m_eval.get("best_rank"))
                metric = m_eval.get(
                    "reciprocal_rank", m_eval.get("best_match_percent")
                )
                return success, rank, metric, top_ids

            b_succ, b_rank, b_metric, b_ids = extract_eval_cols("baseline")
            o_succ, o_rank, o_metric, o_ids = extract_eval_cols("optimized")
            x_succ, x_rank, x_metric, x_ids = extract_eval_cols("orchestrated")

            task_origin = (
                "dynamic_builder"
                if str(sub["scenario_id"] or "").startswith("dynamic_spec_")
                else "predefined_scenario"
            )

            writer.writerow(
                [
                    sub["submission_id"],
                    sub["session_id"],
                    sub["submitted_at"],
                    task_origin,
                    sub["search_type"],
                    sub["scenario_id"],
                    sub["category"],
                    sub["query"],
                    sub["hidden_target_json"],
                    b_succ,
                    b_rank,
                    b_metric,
                    b_ids,
                    o_succ,
                    o_rank,
                    o_metric,
                    o_ids,
                    x_succ,
                    x_rank,
                    x_metric,
                    x_ids,
                    sub["overall_satisfaction"],
                    sub["perceived_relevance"],
                    sub["ease_of_finding"],
                    sub["perceived_usefulness"],
                    sub["perceived_diversity"],
                    sub["product_confidence"],
                    sub["purchase_intention"],
                    sub["return_intention"],
                    sub["repeat_purchase_intention"],
                    sub["target_retrieval_outcome"],
                    sub["preferred_condition"],
                    cond_ratings.get("baseline", {}).get("overallSatisfaction"),
                    cond_ratings.get("optimized", {}).get("overallSatisfaction"),
                    cond_ratings.get("orchestrated", {}).get("overallSatisfaction"),
                    sub["comments"],
                ]
            )

        return output.getvalue()
