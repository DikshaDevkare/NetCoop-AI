"""
Standard enumerations for the NetCoop AI Interoperability Protocol (v1.0).

Defines canonical values for message types, agent identifiers, severities,
confidence levels, device types, metric categories, metric names, and measurement units.
All enums serialize to lowercase strings for cross-platform interoperability.
"""

from enum import Enum


class MessageType(str, Enum):
    """Supported protocol message types for agent communication."""

    TELEMETRY = "telemetry"
    DEVICE_HEALTH = "device_health"
    CONNECTIVITY = "connectivity"
    OBSERVATION = "observation"
    EVIDENCE = "evidence"
    DIAGNOSTIC_FINDING = "diagnostic_finding"
    STATUS = "status"
    ERROR = "error"


class AgentId(str, Enum):
    """Standardized identifiers for specialized agents, orchestrator, and system."""

    TELEMETRY_PERFORMANCE = "telemetry_performance"
    INFRASTRUCTURE_HEALTH = "infrastructure_health"
    CONNECTIVITY_ANALYSIS = "connectivity_analysis"
    FAULT_CORRELATION = "fault_correlation"
    RECOMMENDATION_REPORTING = "recommendation_reporting"
    ORCHESTRATOR = "orchestrator"
    SYSTEM = "system"


class Severity(str, Enum):
    """Standard severity classifications for observations and findings."""

    INFORMATIONAL = "informational"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ConfidenceLevel(str, Enum):
    """Categorical confidence levels for agent diagnostic findings."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MetricCategory(str, Enum):
    """High-level classification categories for network telemetry metrics."""

    PERFORMANCE = "performance"
    INFRASTRUCTURE = "infrastructure"
    CONNECTIVITY = "connectivity"
    AVAILABILITY = "availability"


class DeviceType(str, Enum):
    """Recognized network device categories."""

    ROUTER = "router"
    SWITCH = "switch"
    ACCESS_POINT = "access_point"
    SERVER = "server"
    CLIENT = "client"
    FIREWALL = "firewall"
    GATEWAY = "gateway"
    OTHER = "other"


class MetricName(str, Enum):
    """Standardized telemetry metric identifiers across all network domains."""

    # Performance metrics
    LATENCY = "latency"
    PACKET_LOSS = "packet_loss"
    JITTER = "jitter"
    THROUGHPUT = "throughput"
    BANDWIDTH_UTILIZATION = "bandwidth_utilization"

    # Infrastructure metrics
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    INTERFACE_STATUS = "interface_status"
    DEVICE_UPTIME = "device_uptime"
    TEMPERATURE = "temperature"

    # Connectivity metrics
    DNS_RESPONSE_TIME = "dns_response_time"
    DNS_RESOLUTION_STATUS = "dns_resolution_status"
    DHCP_STATUS = "dhcp_status"
    GATEWAY_REACHABILITY = "gateway_reachability"
    INTERFACE_CONNECTIVITY = "interface_connectivity"


class MetricUnit(str, Enum):
    """Canonical measurement units for telemetry observations."""

    MILLISECONDS = "ms"
    PERCENTAGE = "%"
    MEGABITS_PER_SECOND = "Mbps"
    SECONDS = "seconds"
    CELSIUS = "Celsius"
    STATUS = "status"
    BOOLEAN = "boolean"
    UNITLESS = "unitless"
