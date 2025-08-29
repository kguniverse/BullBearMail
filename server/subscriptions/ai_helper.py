import os
import logging

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
USE_OPENAI = bool(OPENAI_API_KEY)


def _simple_rule_recommendation(details: dict) -> tuple[str, str]:
    """Return (action, reason) based on simple price movement rules.
    Expects details to contain either 'change_percent' or 'price' and 'prev_close'.
    """
    try:
        pct = None
        if details is None:
            return "HOLD", "No data"
        if "change_percent" in details:
            pct = float(details.get("change_percent", 0))
        elif "price" in details and "prev_close" in details:
            prev = float(details.get("prev_close") or 0)
            price = float(details.get("price") or 0)
            if prev:
                pct = (price - prev) / prev * 100
        if pct is None:
            return "HOLD", "Insufficient price data"
        if pct >= 2.0:
            return "BUY", f"Price up {pct:.2f}% vs prev close"
        if pct <= -2.0:
            return "SELL", f"Price down {pct:.2f}% vs prev close"
        return "HOLD", f"Price change {pct:.2f}% — no strong signal"
    except Exception as e:
        logger.exception("Error in simple_rule_recommendation")
        return "HOLD", "Error computing rule"


def generate_recommendation(details: list):
    """
    Generate recommendation(s) for one or more stocks.
    details is a list of dicts, batch all stocks in one OpenAI prompt and return a dict keyed by stock_ticker.
    """
    if not details:
        return {}
    if USE_OPENAI:
        try:
            import openai
            openai.api_key = OPENAI_API_KEY
            # 构造 prompt
            prompt = (
                "For each stock in the following list, review the historical price data and current market details, then provide a concise investment recommendation: BUY/SELL/HOLD, and explain the reason in one sentence.\n\n"
                "Input: " + str(details) + "\n\n"
                "Respond ONLY with a valid JSON array, no markdown, no code block, no explanation. Each array element must be a JSON object with keys 'stock_ticker', 'action', 'reason'. Example: [{\"stock_ticker\": \"AAPL\", \"action\": \"BUY\", \"reason\": \"Strong upward trend\"}]"
            )
            resp = openai.chat.completions.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4.1"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=120 * len(details),
                temperature=0.3,
            )
            text = resp.choices[0].message.content
            import json
            try:
                parsed = json.loads(text)
                # 返回 dict: {stock_ticker: {action, reason, source}}
                out = {}
                for item in parsed:
                    ticker = item.get("stock_ticker")
                    out[ticker] = {
                        "action": item.get("action", "HOLD"),
                        "reason": item.get("reason", ""),
                        "source": "openai"
                    }
                return out
            except Exception:
                logger.exception("OpenAI batch parse failed, falling back to rules")
                # fallback: 用本地规则
                out = {}
                for d in details:
                    ticker = d.get("stock_ticker")
                    action, reason = _simple_rule_recommendation(d)
                    out[ticker] = {"action": action, "reason": reason, "source": "rules_fallback"}
                return out
        except Exception:
            logger.exception("OpenAI batch recommendation failed, falling back to rules")
            out = {}
            for d in details:
                ticker = d.get("stock_ticker")
                action, reason = _simple_rule_recommendation(d)
                out[ticker] = {"action": action, "reason": reason, "source": "rules_fallback"}
            return out
    else:
        out = {}
        for d in details:
            ticker = d.get("stock_ticker")
            action, reason = _simple_rule_recommendation(d)
            out[ticker] = {"action": action, "reason": reason, "source": "rules"}
        return out
