"""
Standard telemetry schema and metric validation rules for NetCoop AI.

Defines canonical telemetry records and enforces strict metric-to-unit mappings,
category alignment, type correctness, and numerical bounds.
"""

from typing import Any, Dict, Optional, Set, Union
from pydantic import Field, model_validator

from app.schemas.common import ProtocolBaseModel, UTCDatetime
from app.schemas.enums import MetricCategory, MetricName, MetricUnit


class MetricSpecification:
    """Specification defining expected category, allowed units, value types, and bounds."""

    def __init__(
        self,
        category: MetricCategory,
        allowed_units: Set[MetricUnit],
        is_numeric: bool,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        allowed_statuses: Optional[Set[str]] = None,
    ):
        self.category = category
        self.allowed_units = allowed_units
        self.is_numeric = is_numeric
        self.min_value = min_value
        self.max_value = max_value
        self.allowed_statuses = allowed_statuses


# Centralized registry of standard metric validation rules
METRIC_REGISTRY: Dict[MetricName, MetricSpecification] = {
    # Performance metrics
    MetricName.LATENCY: MetricSpecification(
        category=MetricCategory.PERFORMANCE,
        allowed_units={MetricUnit.MILLISECONDS},
        is_numeric=True,
        min_value=0.0,
    ),
    MetricName.PACKET_LOSS: MetricSpecification(
        category=MetricCategory.PERFORMANCE,
        allowed_units={MetricUnit.PERCENTAGE},
        is_numeric=True,
        min_value=0.0,
        max_value=100.0,
    ),
    MetricName.JITTER: MetricSpecification(
        category=MetricCategory.PERFORMANCE,
        allowed_units={MetricUnit.MILLISECONDS},
        is_numeric=True,
        min_value=0.0,
    ),
    MetricName.THROUGHPUT: MetricSpecification(
        category=MetricCategory.PERFORMANCE,
        allowed_units={MetricUnit.MEGABITS_PER_SECOND},
        is_numeric=True,
        min_value=0.0,
    ),
    MetricName.BANDWIDTH_UTILIZATION: MetricSpecification(
        category=MetricCategory.PERFORMANCE,
        allowed_units={MetricUnit.PERCENTAGE},
        is_numeric=True,
        min_value=0.0,
        max_value=100.0,
    ),
    # Infrastructure metrics
    MetricName.CPU_USAGE: MetricSpecification(
        category=MetricCategory.INFRASTRUCTURE,
        allowed_units={MetricUnit.PERCENTAGE},
        is_numeric=True,
        min_value=0.0,
        max_value=100.0,
    ),
    MetricName.MEMORY_USAGE: MetricSpecification(
        category=MetricCategory.INFRASTRUCTURE,
        allowed_units={MetricUnit.PERCENTAGE},
        is_numeric=True,
        min_value=0.0,
        max_value=100.0,
    ),
    MetricName.INTERFACE_STATUS: MetricSpecification(
        category=MetricCategory.INFRASTRUCTURE,
        allowed_units={MetricUnit.STATUS},
        is_numeric=False,
        allowed_statuses={"up", "down", "degraded", "admin_down", "testing", "unknown"},
    ),
    MetricName.DEVICE_UPTIME: MetricSpecification(
        category=MetricCategory.INFRASTRUCTURE,
        allowed_units={MetricUnit.SECONDS},
        is_numeric=True,
        min_value=0.0,
    ),
    MetricName.TEMPERATURE: MetricSpecification(
        category=MetricCategory.INFRASTRUCTURE,
        allowed_units={MetricUnit.CELSIUS},
        is_numeric=True,
        min_value=-50.0,
        max_value=150.0,
    ),
    # Connectivity metrics
    MetricName.DNS_RESPONSE_TIME: MetricSpecification(
        category=MetricCategory.CONNECTIVITY,
        allowed_units={MetricUnit.MILLISECONDS},
        is_numeric=True,
        min_value=0.0,
    ),
    MetricName.DNS_RESOLUTION_STATUS: MetricSpecification(
        category=MetricCategory.CONNECTIVITY,
        allowed_units={MetricUnit.STATUS},
        is_numeric=False,
        allowed_statuses={"success", "failed", "timeout", "degraded"},
    ),
    MetricName.DHCP_STATUS: MetricSpecification(
        category=MetricCategory.CONNECTIVITY,
        allowed_units={MetricUnit.STATUS},
        is_numeric=False,
        allowed_statuses={"assigned", "failed", "timeout", "renewed", "expired"},
    ),
    MetricName.GATEWAY_REACHABILITY: MetricSpecification(
        category=MetricCategory.CONNECTIVITY,
        allowed_units={MetricUnit.STATUS, MetricUnit.BOOLEAN},
        is_numeric=False,
        allowed_statuses={"reachable", "unreachable", "degraded", "unknown", "true", "false"},
    ),
    MetricName.INTERFACE_CONNECTIVITY: MetricSpecification(
        category=MetricCategory.CONNECTIVITY,
        allowed_units={MetricUnit.STATUS},
        is_numeric=False,
        allowed_statuses={"connected", "disconnected", "degraded"},
    ),
}


class TelemetryRecord(ProtocolBaseModel):
    """
    Canonical telemetry observation record.
    Supports both numeric metrics and status-based observations with strict validation.
    """

    telemetry_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for this telemetry observation (e.g. 'TEL-001')",
        examples=["TEL-001"],
    )
    device_id: str = Field(
        ...,
        min_length=1,
        description="Identifier of the monitored network device",
        examples=["AP-101"],
    )
    metric_name: MetricName = Field(
        ...,
        description="Standardized name of the observed metric",
        examples=[MetricName.LATENCY],
    )
    metric_category: MetricCategory = Field(
        ...,
        description="High-level category corresponding to the metric",
        examples=[MetricCategory.PERFORMANCE],
    )
    value: Union[float, int, str, bool] = Field(
        ...,
        description="Observed measurement (numeric magnitude or status string/boolean)",
        examples=[125.5],
    )
    unit: MetricUnit = Field(
        ...,
        description="Standardized unit of measurement (e.g. 'ms', '%', 'Mbps', 'status')",
        examples=[MetricUnit.MILLISECONDS],
    )
    timestamp: UTCDatetime = Field(
        ...,
        description="Timezone-aware UTC timestamp when observation occurred",
        examples=["2026-10-31T17:30:00Z"],
    )
    source: str = Field(
        ...,
        min_length=1,
        description="Collector, probe, or telemetry agent producing the observation",
        examples=["snmp_collector_01"],
    )
    quality: Optional[str] = Field(
        None,
        description="Quality assessment of the reading (e.g. 'good', 'estimated', 'suspect')",
        examples=["good"],
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional contextual key-value pairs",
        examples=[{"interface": "eth0", "sampling_rate_sec": 10}],
    )

    @model_validator(mode="after")
    def validate_metric_contract(self) -> "TelemetryRecord":
        """
        Validate that metric name, category, unit, value type, and bounds comply with standard rules.
        """
        rule = METRIC_REGISTRY.get(self.metric_name)
        if not rule:
            # Unregistered metric name
            return self

        # 1. Validate Category
        if self.metric_category != rule.category:
            raise ValueError(
                f"Metric category mismatch for '{self.metric_name.value}': "
                f"expected '{rule.category.value}', got '{self.metric_category.value}'."
            )

        # 2. Validate Unit
        if self.unit not in rule.allowed_units:
            allowed = ", ".join(f"'{u.value}'" for u in rule.allowed_units)
            raise ValueError(
                f"Unsupported unit '{self.unit.value}' for metric '{self.metric_name.value}'. "
                f"Allowed unit(s): {allowed}."
            )

        # 3. Validate Value Type & Numerical Bounds
        if rule.is_numeric:
            if isinstance(self.value, bool) or not isinstance(self.value, (int, float)):
                raise ValueError(
                    f"Metric '{self.metric_name.value}' requires a numeric value (int or float), "
                    f"got {type(self.value).__name__} ('{self.value}')."
                )
            num_val = float(self.value)
            if rule.min_value is not None and num_val < rule.min_value:
                raise ValueError(
                    f"Value for '{self.metric_name.value}' cannot be less than {rule.min_value}; "
                    f"got {num_val}."
                )
            if rule.max_value is not None and num_val > rule.max_value:
                raise ValueError(
                    f"Value for '{self.metric_name.value}' cannot exceed {rule.max_value}; "
                    f"got {num_val}."
                )
        else:
            # Status-based or boolean metrics
            if isinstance(self.value, bool):
                val_str = str(self.value).lower()
            elif isinstance(self.value, str):
                val_str = self.value.strip().lower()
            else:
                raise ValueError(
                    f"Metric '{self.metric_name.value}' requires a status string or boolean, "
                    f"got {type(self.value).__name__}."
                )
            if rule.allowed_statuses and val_str not in rule.allowed_statuses:
                allowed_str = ", ".join(f"'{s}'" for s in sorted(rule.allowed_statuses))
                raise ValueError(
                    f"Invalid status value '{self.value}' for metric '{self.metric_name.value}'. "
                    f"Allowed status values: {allowed_str}."
                )

        return self
