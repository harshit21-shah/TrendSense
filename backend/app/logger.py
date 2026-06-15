import structlog
import logging
import sys
import io
from .config import settings


def _utf8_stdout() -> io.TextIOWrapper:
    """Return a UTF-8 stdout wrapper — prevents UnicodeEncodeError on Windows CP1252."""
    if hasattr(sys.stdout, "buffer"):
        return io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
    return sys.stdout  # type: ignore[return-value]


def setup_logging():
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.processors.JSONRenderer() if settings.ENVIRONMENT == "production" else structlog.dev.ConsoleRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=_utf8_stdout(),
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    )

def get_logger(name: str):
    return structlog.get_logger(name)

setup_logging()
logger = get_logger("trendsense")
