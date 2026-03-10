"""
AWS Lambda entrypoint using Mangum.
Set Lambda handler to: app.lambda_handler.handler
"""
import logging

logger = logging.getLogger(__name__)

# Lazy-load app so cold start only loads this module; first request pays app import cost.
# Reduces risk of init timeout when container starts.
_app = None
_mangum = None


def _get_mangum():
    global _app, _mangum
    if _mangum is None:
        from mangum import Mangum
        from app.main import app
        _app = app
        _mangum = Mangum(app, lifespan="off")
    return _mangum


def handler(event, context):
    try:
        return _get_mangum()(event, context)
    except Exception as exc:
        logger.exception("Lambda handler error: %s", exc)
        raise
