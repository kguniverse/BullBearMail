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


def generate_recommendation(details: dict) -> dict:
    """Generate recommendation dict: {action, reason, source}. Use OpenAI if available, else simple rules."""
    if USE_OPENAI:
        try:
            import openai
            openai.api_key = OPENAI_API_KEY
            prompt = (
                "First, search for the historical price data of this stock. "
                "Then, based on these historical prices and the current market details, provide a concise investment recommendation: BUY/SELL/HOLD, and explain the reason in one sentence.\n\n"
                f"Current market details: {details}\n\nPlease reply in JSON format, including 'action' and 'reason' fields."
            )
            # 新版接口
            resp = openai.chat.completions.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4.1"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60,
                temperature=0.3,
            )
            text = resp.choices[0].message.content
            print("OpenAI response:", text)
            import json
            try:
                parsed = json.loads(text)
                return {"action": parsed.get("action", "HOLD"), "reason": parsed.get("reason", ""), "source": "openai"}
            except Exception:
                # fallback: parse lines
                lines = text.strip().splitlines()
                action = "HOLD"
                reason = ""
                for ln in lines:
                    up = ln.upper()
                    if "BUY" in up:
                        action = "BUY"
                        reason = ln
                        break
                    if "SELL" in up:
                        action = "SELL"
                        reason = ln
                        break
                    if "HOLD" in up:
                        action = "HOLD"
                        reason = ln
                        break
                return {"action": action, "reason": reason, "source": "openai_raw"}
        except Exception:
            logger.exception("OpenAI recommendation failed, falling back to rules")
            action, reason = _simple_rule_recommendation(details)
            return {"action": action, "reason": reason, "source": "rules_fallback"}
    else:
        action, reason = _simple_rule_recommendation(details)
        return {"action": action, "reason": reason, "source": "rules"}
