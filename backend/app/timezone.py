"""
DMV area timezone (DC, Maryland, Virginia). All backend "now" and date display use this.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

# America/New_York = Eastern (covers DC/MD/VA)
TIMEZONE = "America/New_York"
EASTERN = ZoneInfo(TIMEZONE)


def now_eastern() -> datetime:
    """Current time in DMV (Eastern). Timezone-aware; safe to store in TIMESTAMPTZ."""
    return datetime.now(EASTERN)


def as_eastern(dt: datetime) -> datetime:
    """Convert datetime to Eastern for time-of-day cutoff. Naive = UTC."""
    from zoneinfo import ZoneInfo
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    return dt.astimezone(EASTERN)
