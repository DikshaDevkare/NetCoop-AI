"""
Lightweight campus network topology service for multi-device correlation.
"""

from typing import Any, Dict, List, Optional, Set


class CampusTopologyService:
    """
    Provides network tier mapping, hierarchical segment resolution,
    and multi-device fault scope analysis.
    """

    TIER_ORDER = {
        "Core Routing Tier": 1,
        "Distribution Aggregation Tier": 2,
        "Building Access Switch Tier": 3,
        "Campus Wireless AP Tier": 4,
        "General Campus Segment": 5,
    }

    @classmethod
    def infer_device_tier(cls, device_id: str, device_type: Optional[str] = None) -> str:
        did = device_id.upper()
        dtype = (device_type or "").upper()
        if "CORE" in did or "RTR" in did or "ROUTER" in dtype:
            return "Core Routing Tier"
        if "DIST" in did or "AGG" in did:
            return "Distribution Aggregation Tier"
        if "ACC" in did or "EDGE" in did or "SW" in did:
            return "Building Access Switch Tier"
        if "AP" in did or "WIFI" in did or "WIRELESS" in dtype:
            return "Campus Wireless AP Tier"
        return "General Campus Segment"

    @classmethod
    def analyze_fault_scope(
        cls,
        affected_devices: List[str],
        device_anomalies: Optional[Dict[str, List[str]]] = None,
    ) -> Dict[str, Any]:
        """
        Distinguishes between localized device faults and shared upstream infrastructure faults.
        """
        if not affected_devices:
            return {
                "scope": "none",
                "is_shared_infrastructure_fault": False,
                "summary": "No devices affected.",
                "root_tier": None,
            }

        tiers = {did: cls.infer_device_tier(did) for did in affected_devices}
        unique_tiers = set(tiers.values())
        device_count = len(affected_devices)

        # Single device affected
        if device_count == 1:
            did = affected_devices[0]
            tier = tiers[did]
            return {
                "scope": "device_local",
                "is_shared_infrastructure_fault": False,
                "summary": f"Isolated device anomaly localized to {did} in {tier}.",
                "root_tier": tier,
                "affected_tiers": [tier],
            }

        # Multiple devices affected
        has_core = "Core Routing Tier" in unique_tiers
        has_dist = "Distribution Aggregation Tier" in unique_tiers
        has_ap = "Campus Wireless AP Tier" in unique_tiers
        has_access = "Building Access Switch Tier" in unique_tiers

        if has_core:
            summary = (
                f"Shared infrastructure fault originating in Core Routing Tier affecting "
                f"{device_count} devices across multiple downstream tiers ({', '.join(sorted(unique_tiers))})."
            )
            root_tier = "Core Routing Tier"
        elif has_dist:
            summary = (
                f"Shared distribution aggregation bottleneck impacting {device_count} downstream access nodes."
            )
            root_tier = "Distribution Aggregation Tier"
        elif has_ap and not has_access:
            summary = (
                f"Coordinated or localized wireless degradation across {device_count} access points; switch fabric nominal."
            )
            root_tier = "Campus Wireless AP Tier"
        else:
            summary = (
                f"Multi-device telemetry anomaly spanning {device_count} devices across {len(unique_tiers)} network segments."
            )
            root_tier = sorted(unique_tiers, key=lambda t: cls.TIER_ORDER.get(t, 99))[0]

        return {
            "scope": "shared_infrastructure" if (has_core or has_dist or len(unique_tiers) > 1) else "segment_wide",
            "is_shared_infrastructure_fault": has_core or has_dist or len(unique_tiers) > 1,
            "summary": summary,
            "root_tier": root_tier,
            "affected_tiers": sorted(list(unique_tiers)),
        }
