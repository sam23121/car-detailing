"""Send email via SMTP (no third-party services). Uses Python stdlib smtplib + email."""
import errno
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Tuple

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
# e.g. "you@gmail.com" or "Quality Detailing <you@gmail.com>"
FROM_EMAIL = os.environ.get("FROM_EMAIL", "").strip()
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "").strip()


def is_configured() -> bool:
    """Return True if SMTP is configured enough to send mail."""
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD and FROM_EMAIL)


def _parse_from_email(raw: str) -> Tuple[str, str]:
    """Return (display_name, address). If no angle bracket, use address as name."""
    raw = raw.strip()
    if "<" in raw and ">" in raw:
        part = raw.split("<", 1)[1].split(">", 1)[0].strip()
        name = raw.split("<", 1)[0].strip().strip('"\'')
        return (name or part, part)
    return (raw, raw)


def send_email(to: str, subject: str, body_text: str, html: bool = False) -> bool:
    """
    Send an email via SMTP. Uses STARTTLS on port 587 by default.
    body_text: plain text body; if html=True it's treated as HTML.
    Returns True if sent, False if skipped or failed.
    """
    if not is_configured():
        logger.warning("SMTP not configured; skipping email to %s", to)
        return False
    to = (to or "").strip()
    if not to:
        logger.warning("No recipient; skipping email")
        return False
    try:
        display_name, from_addr = _parse_from_email(FROM_EMAIL)
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((display_name, from_addr))
        msg["To"] = to
        if html:
            msg.attach(MIMEText(body_text, "html", "utf-8"))
        else:
            msg.attach(MIMEText(body_text, "plain", "utf-8"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(from_addr, [to], msg.as_string())
        logger.info("Email sent to %s: %s", to, subject[:50])
        return True
    except OSError as e:
        if getattr(e, "errno", None) == errno.ENETUNREACH:
            logger.warning(
                "SMTP connection failed (network unreachable). "
                "Outbound port %s is often blocked in Docker/cloud. "
                "Allow outbound TCP to %s:%s or run the app where SMTP is allowed.",
                SMTP_PORT, SMTP_HOST, SMTP_PORT,
            )
        else:
            logger.exception("SMTP send failed to %s: %s", to, e)
        return False
    except Exception as e:
        logger.exception("SMTP send failed to %s: %s", to, e)
        return False
