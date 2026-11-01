"""
Unit tests for CampusTopologyService and multi-device scoping.
"""

from app.services.topology import CampusTopologyService


def test_device_tier_inference() -> None:
    assert CampusTopologyService.infer_device_tier("RTR-CORE-01") == "Core Routing Tier"
    assert CampusTopologyService.infer_device_tier("SW-CORE-01") == "Core Routing Tier"
    assert CampusTopologyService.infer_device_tier("SW-DIST-01") == "Distribution Aggregation Tier"
    assert CampusTopologyService.infer_device_tier("SW-ACC-01") == "Building Access Switch Tier"
    assert CampusTopologyService.infer_device_tier("AP-DORM-01") == "Campus Wireless AP Tier"
    assert CampusTopologyService.infer_device_tier("UNKNOWN-NODE") == "General Campus Segment"


def test_single_device_local_scope() -> None:
    res = CampusTopologyService.analyze_fault_scope(["AP-DORM-01"])
    assert res["scope"] == "device_local"
    assert res["is_shared_infrastructure_fault"] is False
    assert res["root_tier"] == "Campus Wireless AP Tier"


def test_shared_core_infrastructure_fault_scope() -> None:
    res = CampusTopologyService.analyze_fault_scope(["RTR-CORE-01", "SW-DIST-01", "AP-DORM-01"])
    assert res["scope"] == "shared_infrastructure"
    assert res["is_shared_infrastructure_fault"] is True
    assert res["root_tier"] == "Core Routing Tier"
    assert len(res["affected_tiers"]) == 3


def test_distribution_shared_bottleneck_scope() -> None:
    res = CampusTopologyService.analyze_fault_scope(["SW-DIST-01", "SW-ACC-01"])
    assert res["scope"] == "shared_infrastructure"
    assert res["is_shared_infrastructure_fault"] is True
    assert res["root_tier"] == "Distribution Aggregation Tier"


def test_empty_scope() -> None:
    res = CampusTopologyService.analyze_fault_scope([])
    assert res["scope"] == "none"
    assert res["is_shared_infrastructure_fault"] is False
