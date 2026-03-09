"""
Send email via Resend (primary, 100 free/day), then Brevo or MailerSend as fallback
when Resend fails (e.g. rate limit).
"""
import json
import logging
import os
import urllib.error
import urllib.request
from typing import Tuple

logger = logging.getLogger(__name__)

# Resend (primary – 100 free emails/day)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
RESEND_FROM = (
    os.environ.get("RESEND_FROM", "").strip()
    or os.environ.get("FROM_EMAIL", "").strip()
)

# Brevo (fallback – free tier available)
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "").strip()
BREVO_FROM = (
    os.environ.get("BREVO_FROM", "").strip()
    or RESEND_FROM
    or os.environ.get("FROM_EMAIL", "").strip()
)

# MailerSend (fallback)
MAILERSEND_API_KEY = os.environ.get("MAILERSEND_API_KEY", "").strip()
MAILERSEND_FROM = (
    os.environ.get("MAILERSEND_FROM", "").strip()
    or BREVO_FROM
    or os.environ.get("FROM_EMAIL", "").strip()
)

OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "").strip()


def is_configured() -> bool:
    """True if at least one provider is configured."""
    return bool(
        (RESEND_API_KEY and RESEND_FROM)
        or (BREVO_API_KEY and BREVO_FROM)
        or (MAILERSEND_API_KEY and MAILERSEND_FROM)
    )


def _parse_from(raw: str) -> Tuple[str, str]:
    """Return (display_name, email)."""
    raw = (raw or "").strip()
    if "<" in raw and ">" in raw:
        email = raw.split("<", 1)[1].split(">", 1)[0].strip()
        name = raw.split("<", 1)[0].strip().strip('"\'')
        return (name or email, email)
    return (raw, raw) if raw else ("", "")


def _send_resend(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY or not RESEND_FROM:
        return False
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info("Email sent via Resend to %s", to)
        return True
    except Exception as e:
        resp = getattr(e, "response", None)
        code = getattr(e, "status_code", None)
        if code is None and resp:
            code = getattr(resp, "status_code", None)
        if code == 429:
            logger.warning("Resend rate limit (429); will try fallback")
        else:
            logger.warning("Resend failed to %s: %s", to, e)
        return False


def _send_brevo(to: str, subject: str, html: str) -> bool:
    if not BREVO_API_KEY or not BREVO_FROM:
        return False
    name, email = _parse_from(BREVO_FROM)
    if not email:
        return False
    body = {
        "sender": {"name": name or email, "email": email},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html,
    }
    try:
        req = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            if 200 <= resp.status < 300:
                logger.info("Email sent via Brevo to %s", to)
                return True
    except urllib.error.HTTPError as e:
        logger.warning("Brevo failed to %s: %s %s", to, e.code, e.reason)
    except Exception as e:
        logger.warning("Brevo failed to %s: %s", to, e)
    return False


def _send_mailersend(to: str, subject: str, html: str, text: str) -> bool:
    if not MAILERSEND_API_KEY or not MAILERSEND_FROM:
        return False
    name, email = _parse_from(MAILERSEND_FROM)
    if not email:
        return False
    body = {
        "from": {"email": email, "name": name or email},
        "to": [{"email": to}],
        "subject": subject,
        "html": html,
        "text": text or html.replace("<br>", "\n").replace("<br>\n", "\n"),
    }
    try:
        req = urllib.request.Request(
            "https://api.mailersend.com/v1/email",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {MAILERSEND_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status in (200, 202):
                logger.info("Email sent via MailerSend to %s", to)
                return True
    except urllib.error.HTTPError as e:
        logger.warning("MailerSend failed to %s: %s %s", to, e.code, e.reason)
    except Exception as e:
        logger.warning("MailerSend failed to %s: %s", to, e)
    return False


def send_email(to: str, subject: str, body_text: str, html: bool = False) -> bool:
    """
    Send email: try Resend first, then Brevo, then MailerSend.
    body_text: plain text; if html=True, treated as HTML.
    Returns True if any provider succeeded.
    """
    to = (to or "").strip()
    if not to:
        logger.warning("No recipient; skipping email")
        return False
    if not is_configured():
        logger.warning("No email provider configured; skipping email to %s", to)
        return False
    html_body = body_text if html else body_text.replace("\n", "<br>\n")
    text_body = (
        body_text
        if not html
        else body_text.replace("<br>", "\n").replace("<br>\n", "\n")
    )

    if _send_resend(to, subject, html_body):
        return True
    if _send_brevo(to, subject, html_body):
        return True
    if _send_mailersend(to, subject, html_body, text_body):
        return True
    logger.error("All email providers failed for %s", to)
    return False
