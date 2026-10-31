"""
Unit tests for multi-device incident and scenario generation.
"""

from ml.generators.incident_generator import IncidentGenerator
from ml.generators.scenario_generator import ScenarioGenerator


def test_scenario_generator_all_clean_scenarios() -> None:
    """Verify all 7 clean scenarios produce valid metric structures and conform to specified ranges."""
    gen = ScenarioGenerator(seed=42)
    scenarios = [
        "normal",
        "latency_spike",
        "hardware_failure",
        "congestion",
        "weak_wifi",
        "interface_fault",
        "dns_dhcp_failure",
    ]
    for scn in scenarios:
        res = gen.generate_scenario_metrics(scenario_label=scn, device_type="switch")
        assert "metrics" in res
        assert "status" in res
        assert res["status"] in ["Healthy", "Warning", "Critical"]
        assert "latency_ms" in res["metrics"]

    # Explicit audit of the 3 organizer scenarios within ScenarioGenerator
    normal_res = gen.generate_scenario_metrics("normal", "switch")
    nm = normal_res["metrics"]
    assert 10.0 <= nm["cpu_utilization_pct"] <= 35.0
    assert 20.0 <= nm["link_utilization_pct"] <= 50.0
    assert nm["packet_loss_pct"] == 0.0
    assert 5.0 <= nm["latency_ms"] <= 20.0
    assert 1.0 <= nm["jitter_ms"] <= 5.0
    assert nm["queue_drops"] == 0

    spike_res = gen.generate_scenario_metrics("latency_spike", "switch")
    sm = spike_res["metrics"]
    assert 40.0 <= sm["cpu_utilization_pct"] <= 70.0
    assert 60.0 <= sm["link_utilization_pct"] <= 85.0
    assert 0.1 <= sm["packet_loss_pct"] <= 1.5
    assert 150.0 <= sm["latency_ms"] <= 400.0
    assert 30.0 <= sm["jitter_ms"] <= 80.0
    assert 0 <= sm["queue_drops"] <= 50

    hw_res = gen.generate_scenario_metrics("hardware_failure", "switch")
    hm = hw_res["metrics"]
    assert hm["cpu_utilization_pct"] == 99.9
    assert hm["link_utilization_pct"] == 100.0
    assert 15.0 <= hm["packet_loss_pct"] <= 30.0
    assert 500.0 <= hm["latency_ms"] <= 1000.0
    assert 5000 <= hm["queue_drops"] <= 15000
    assert 100 <= hm["interface_errors"] <= 500


def test_incident_generator_reproducibility() -> None:
    """Verify same seed produces identical incidents."""
    gen1 = IncidentGenerator(seed=123)
    gen2 = IncidentGenerator(seed=123)

    records1 = gen1.generate_incident(incident_id="INC-TEST-01", scenario_label="congestion")
    records2 = gen2.generate_incident(incident_id="INC-TEST-01", scenario_label="congestion")

    assert len(records1) == len(records2)
    assert records1[0]["metrics"] == records2[0]["metrics"]
    assert records1[0]["timestamp"] == records2[0]["timestamp"]


def test_incident_generator_different_seeds_variation() -> None:
    """Verify different seeds produce varied metric readings."""
    gen1 = IncidentGenerator(seed=101)
    gen2 = IncidentGenerator(seed=202)

    records1 = gen1.generate_incident(incident_id="INC-TEST-01", scenario_label="congestion")
    records2 = gen2.generate_incident(incident_id="INC-TEST-02", scenario_label="congestion")

    assert records1[0]["metrics"] != records2[0]["metrics"]


def test_incident_chronological_ordering() -> None:
    """Verify observations inside an incident are chronologically sorted."""
    gen = IncidentGenerator(seed=42)
    records = gen.generate_incident(incident_id="INC-ORDER-01", scenario_label="normal")

    timestamps = [r["timestamp"] for r in records]
    assert timestamps == sorted(timestamps)


def test_interoperability_failure_corpus_generation() -> None:
    """Verify malformed interoperability corpus produces intentional flaws."""
    gen = ScenarioGenerator(seed=999)
    malformed = gen.generate_interoperability_failure_corpus(count=10)
    assert len(malformed) == 10
    for sample in malformed:
        assert "flaw_category" in sample
        assert sample["test_id"].startswith("MALFORMED-")
