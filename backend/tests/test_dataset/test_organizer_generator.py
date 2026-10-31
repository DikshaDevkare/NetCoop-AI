"""
Unit tests for the official organizer synthetic telemetry generator.
Verifies preservation of original scenario logic, status values, exact metric ranges,
and fixed constants across multiple iterations.
"""

import re
from ml.generators.organizer_generator import generate_telemetry


def test_organizer_normal_scenario() -> None:
    """Verify organizer normal scenario status, exact fixed constants, and metrics."""
    data = generate_telemetry(fault_type="normal", seed=42)
    assert data["status"] == "Healthy"
    assert "timestamp" in data
    assert data["timestamp"].endswith("Z")
    assert re.match(r"^SW_CAMPUS_([1-9]|10)$", data["device_id"])

    m = data["metrics"]
    assert 10.0 <= m["cpu_utilization_pct"] <= 35.0
    assert 20.0 <= m["link_utilization_pct"] <= 50.0
    assert m["packet_loss_pct"] == 0.0
    assert 5.0 <= m["latency_ms"] <= 20.0
    assert 1.0 <= m["jitter_ms"] <= 5.0
    assert m["queue_drops"] == 0
    assert "interface_errors" not in m


def test_organizer_latency_spike_scenario() -> None:
    """Verify organizer latency_spike scenario ranges and status."""
    data = generate_telemetry(fault_type="latency_spike", seed=100)
    assert data["status"] == "Warning"
    assert re.match(r"^SW_CAMPUS_([1-9]|10)$", data["device_id"])

    m = data["metrics"]
    assert 40.0 <= m["cpu_utilization_pct"] <= 70.0
    assert 60.0 <= m["link_utilization_pct"] <= 85.0
    assert 0.1 <= m["packet_loss_pct"] <= 1.5
    assert 150.0 <= m["latency_ms"] <= 400.0
    assert 30.0 <= m["jitter_ms"] <= 80.0
    assert 0 <= m["queue_drops"] <= 50
    assert "interface_errors" not in m


def test_organizer_hardware_failure_scenario() -> None:
    """Verify organizer hardware_failure scenario exact fixed values, ranges, and status."""
    data = generate_telemetry(fault_type="hardware_failure", seed=200)
    assert data["status"] == "Critical"
    assert re.match(r"^SW_CAMPUS_([1-9]|10)$", data["device_id"])

    m = data["metrics"]
    # Exact fixed values from organizer specification
    assert m["cpu_utilization_pct"] == 99.9
    assert m["link_utilization_pct"] == 100.0
    # Range bounded metrics
    assert 15.0 <= m["packet_loss_pct"] <= 30.0
    assert 500.0 <= m["latency_ms"] <= 1000.0
    assert 5000 <= m["queue_drops"] <= 15000
    assert 100 <= m["interface_errors"] <= 500


def test_organizer_generator_seed_reproducibility() -> None:
    """Verify same seed produces identical outputs across calls."""
    data1 = generate_telemetry(fault_type="latency_spike", seed=777)
    data2 = generate_telemetry(fault_type="latency_spike", seed=777)
    assert data1["metrics"] == data2["metrics"]
    assert data1["device_id"] == data2["device_id"]
    assert data1["status"] == data2["status"]


def test_organizer_exact_ranges_multi_sample_audit() -> None:
    """
    Exhaustively audit 200 samples per scenario to guarantee that no random sample
    ever violates the exact organizer-provided bounds or fixed values.
    """
    timestamp_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
    device_pattern = re.compile(r"^SW_CAMPUS_([1-9]|10)$")

    for i in range(200):
        # 1. Normal
        normal_data = generate_telemetry(fault_type="normal", seed=1000 + i)
        assert normal_data["status"] == "Healthy"
        assert timestamp_pattern.match(normal_data["timestamp"])
        assert device_pattern.match(normal_data["device_id"])
        nm = normal_data["metrics"]
        assert 10.0 <= nm["cpu_utilization_pct"] <= 35.0
        assert 20.0 <= nm["link_utilization_pct"] <= 50.0
        assert nm["packet_loss_pct"] == 0.0  # Exactly 0
        assert 5.0 <= nm["latency_ms"] <= 20.0
        assert 1.0 <= nm["jitter_ms"] <= 5.0
        assert nm["queue_drops"] == 0  # Exactly 0
        assert "interface_errors" not in nm

        # 2. Latency Spike
        spike_data = generate_telemetry(fault_type="latency_spike", seed=2000 + i)
        assert spike_data["status"] == "Warning"
        assert timestamp_pattern.match(spike_data["timestamp"])
        assert device_pattern.match(spike_data["device_id"])
        sm = spike_data["metrics"]
        assert 40.0 <= sm["cpu_utilization_pct"] <= 70.0
        assert 60.0 <= sm["link_utilization_pct"] <= 85.0
        assert 0.1 <= sm["packet_loss_pct"] <= 1.5
        assert 150.0 <= sm["latency_ms"] <= 400.0
        assert 30.0 <= sm["jitter_ms"] <= 80.0
        assert 0 <= sm["queue_drops"] <= 50
        assert "interface_errors" not in sm

        # 3. Hardware Failure
        hw_data = generate_telemetry(fault_type="hardware_failure", seed=3000 + i)
        assert hw_data["status"] == "Critical"
        assert timestamp_pattern.match(hw_data["timestamp"])
        assert device_pattern.match(hw_data["device_id"])
        hm = hw_data["metrics"]
        assert hm["cpu_utilization_pct"] == 99.9  # Exactly 99.9%
        assert hm["link_utilization_pct"] == 100.0  # Exactly 100.0%
        assert 15.0 <= hm["packet_loss_pct"] <= 30.0
        assert 500.0 <= hm["latency_ms"] <= 1000.0
        assert 5000 <= hm["queue_drops"] <= 15000
        assert 100 <= hm["interface_errors"] <= 500
