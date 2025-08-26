# subscriptions/utils_market.py
from __future__ import annotations
import time
from typing import Optional, Dict
import yfinance as yf
from django.core.cache import cache

_CACHE_TTL = 60  # seconds: short cache to reduce frequent requests

def is_valid_ticker(symbol: str) -> bool:
    """
    Use yfinance's history(..., raise_errors=True) to determine validity.
    If recent 1-day daily data can be retrieved, the symbol is considered valid.
    """
    symbol = (symbol or "").strip()
    if not symbol:
        return False

    cache_key = f"yf_valid:{symbol}"
    hit = cache.get(cache_key)
    if hit is not None:
        return bool(hit)

    try:
        df = yf.Ticker(symbol).history(period="1d", interval="1d", auto_adjust=False, raise_errors=True)
        ok = not df.empty
        cache.set(cache_key, ok, timeout=_CACHE_TTL)
        return ok
    except Exception:
        cache.set(cache_key, False, timeout=_CACHE_TTL)
        return False


def get_realtime_details(symbol: str) -> Optional[Dict]:
    """
    Returns:
    {
      "symbol": "...",
      "price": float,            # Most recent 1-minute Close price
      "currency": "USD"/"CAD"/... (best effort)
      "exchange": str|None,
      "as_of": "2025-08-25T14:35:00Z"
    }
    Returns None if unable to retrieve or invalid symbol.
    """
    symbol = (symbol or "").strip()
    if not symbol:
        return None
    if not is_valid_ticker(symbol):
        raise ValueError("Invalid ticker symbol")
    cache_key = f"yf_price:{symbol}"
    hit = cache.get(cache_key)
    if hit is not None:
        return hit

    try:
        t = yf.Ticker(symbol)

        # Prefer to use 1-minute resolution to fetch the latest quote and timestamp
        hist = t.history(period="1d", interval="1m", auto_adjust=False, raise_errors=True)
        if hist.empty:
            # Fallback to daily interval (when market is closed, at least get the close price of today or the most recent trading day)
            hist = t.history(period="5d", interval="1d", auto_adjust=False, raise_errors=True)
            if hist.empty:
                return None

        last = hist.tail(1)
        price = float(last["Close"].iloc[0])

        idx = last.index[-1]
        try:
            ts_utc = idx.tz_convert("UTC").to_pydatetime()
        except Exception:
            ts_utc = getattr(idx, "to_pydatetime", lambda: idx)()
        as_of = ts_utc.isoformat().replace("+00:00", "Z")

        # Currency/Exchange: try to get from fast_info; leave empty if failed
        currency = None
        exchange = None
        try:
            fi = getattr(t, "fast_info", None)
            if fi:
                # fast_info may be a dict or a dict-like object in different versions
                currency = (fi.get("currency") if hasattr(fi, "get") else getattr(fi, "currency", None)) or currency
                exchange = (fi.get("exchange") if hasattr(fi, "get") else getattr(fi, "exchange", None)) or exchange
        except Exception:
            pass

        data = {
            "symbol": symbol,
            "price": price,
            "currency": currency,
            "exchange": exchange,
            "as_of": as_of,
        }
        cache.set(cache_key, data, timeout=_CACHE_TTL)
        return data
    except Exception:
        return None
