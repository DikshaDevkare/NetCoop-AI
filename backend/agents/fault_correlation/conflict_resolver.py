"""
Conflict resolution and evidence weighting for Fault Correlation Agent.
"""

from typing import Any, Dict, List, Optional, Tuple
from app.schemas.enums import ConfidenceLevel


class ConflictResolver:
    """
    Evaluates conflicting findings across domain agents and adjusts diagnostic confidence.
    """

    @classmethod
    def resolve_conflicts(
        cls,
        findings: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        ml_prediction: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Analyzes findings for competing root-cause hypotheses, assesses evidence alignment,
        and derives an uncertainty penalty.
        """
        causes = [f.get("suspected_cause") for f in findings if f.get("suspected_cause")]
        unique_causes = list(set(causes))

        conflicts: List[Dict[str, Any]] = []
        is_conflicted = len(unique_causes) > 1

        if is_conflicted:
            conflicts.append({
                "type": "competing_hypotheses",
                "description": f"Domain agents proposed {len(unique_causes)} divergent suspected causes: {unique_causes}",
                "hypotheses": unique_causes,
            })

        # Check alignment between ML classifier and rule findings
        ml_fault = (ml_prediction or {}).get("predicted_fault")
        ml_confidence = float((ml_prediction or {}).get("confidence", 0.0))

        if ml_fault and ml_fault != "normal" and unique_causes:
            # Check if ML prediction is supported by any agent finding
            matches = any(ml_fault in c.lower() for c in unique_causes)
            if not matches and ml_confidence > 0.70:
                conflicts.append({
                    "type": "ml_agent_divergence",
                    "description": (
                        f"XGBoost classifier predicted '{ml_fault}' with {ml_confidence * 100:.1f}% confidence, "
                        f"diverging from agent hypotheses: {unique_causes}"
                    ),
                    "ml_predicted_fault": ml_fault,
                })

        # Calculate adjusted confidence
        if conflicts:
            adjusted_confidence = ConfidenceLevel.MEDIUM if len(evidence_items) >= 4 else ConfidenceLevel.LOW
            uncertainty_penalty = 0.25
        else:
            adjusted_confidence = ConfidenceLevel.HIGH if len(evidence_items) >= 3 else ConfidenceLevel.MEDIUM
            uncertainty_penalty = 0.0

        return {
            "has_conflict": len(conflicts) > 0,
            "conflicts": conflicts,
            "adjusted_confidence": adjusted_confidence,
            "uncertainty_penalty": uncertainty_penalty,
            "unique_hypotheses": unique_causes,
        }
