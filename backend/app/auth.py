"""Admin-only access: require X-Admin-Secret header matching ADMIN_SECRET env."""
import os
from typing import Optional
from fastapi import Header, HTTPException

ADMIN_SECRET = os.environ.get("ADMIN_SECRET")


def require_admin(x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret")):
    """Dependency: raise 401 if ADMIN_SECRET is set and header doesn't match."""
    if not ADMIN_SECRET:
        return
    if not x_admin_secret or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Admin access required")
    return
