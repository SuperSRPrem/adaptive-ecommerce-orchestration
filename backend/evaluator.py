import pandas as pd


class Evaluator:

    def __init__(self, engine):
        self.engine = engine


    # --------------------------------------------------
    # SPECIFIC SEARCH
    # Hidden target = exact product ID
    # --------------------------------------------------

    def evaluate_specific(
        self,
        target_product_id,
        results
    ):

        target = str(target_product_id)

        rank = None

        for i, product in enumerate(
            results,
            start=1
        ):

            if str(
                product["product_id"]
            ) == target:

                rank = i
                break

        return {
            "target_success": rank is not None,
            "target_rank": rank,
            "reciprocal_rank":
                1 / rank if rank else 0
        }


    # --------------------------------------------------
    # GENERAL SEARCH
    # Hidden target = desired attributes
    #
    # Example:
    # {
    #   "max_price": 80000,
    #   "ram_gb": 16,
    #   "storage_gb": 512,
    #   "color": "black"
    # }
    # --------------------------------------------------

    def evaluate_general(
        self,
        target_constraints,
        results
    ):

        if not results:

            return {
                "target_success": False,
                "best_match": 0,
                "best_rank": None
            }

        scores = []

        for i, product in enumerate(
            results,
            start=1
        ):

            row = pd.Series(product)

            score = (
                self.engine
                ._constraint_score(
                    row,
                    target_constraints
                )
            )

            scores.append(
                (i, score)
            )

        best_rank, best_score = max(
            scores,
            key=lambda x: x[1]
        )

        return {
            # Full constraint satisfaction
            "target_success":
                best_score >= 0.999,

            "best_match":
                round(
                    float(best_score),
                    4
                ),

            "best_match_percent":
                round(
                    float(best_score) * 100,
                    1
                ),

            "best_rank":
                best_rank
        }


    def evaluate(
        self,
        search_type,
        results,
        target_product_id=None,
        target_constraints=None
    ):

        if search_type == "specific":

            if target_product_id is None:
                raise ValueError(
                    "Specific search requires "
                    "target_product_id"
                )

            return self.evaluate_specific(
                target_product_id,
                results
            )

        if search_type == "general":

            if not target_constraints:
                raise ValueError(
                    "General search requires "
                    "target_constraints"
                )

            return self.evaluate_general(
                target_constraints,
                results
            )

        raise ValueError(
            "search_type must be "
            "specific or general"
        )
