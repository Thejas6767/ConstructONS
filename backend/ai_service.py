import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

_WORKING_MODEL_NAME: Optional[str] = None


def _init_gemini() -> bool:
    """Configures the Google Generative AI SDK using the GEMINI_API_KEY env var."""
    key = os.environ.get("GEMINI_API_KEY") or GEMINI_API_KEY
    if key:
        clean_key = key.strip('"').strip("'").strip()
        genai.configure(api_key=clean_key)
        return True
    logger.warning("[AI Service] GEMINI_API_KEY is not set in .env")
    return False


def _get_working_model_name() -> str:
    """Dynamically queries Google AI API to find the best supported model for this API key."""
    global _WORKING_MODEL_NAME
    if _WORKING_MODEL_NAME:
        return _WORKING_MODEL_NAME

    if not _init_gemini():
        return "gemini-1.5-flash"

    try:
        available = []
        for m in genai.list_models():
            if "generateContent" in getattr(m, "supported_generation_methods", []):
                available.append(m.name)

        logger.info(f"[AI Service] Available models on key: {available}")

        preferred_keywords = [
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-flash",
        ]

        for pref in preferred_keywords:
            for m_name in available:
                if pref in m_name.lower():
                    _WORKING_MODEL_NAME = m_name
                    logger.info(f"[AI Service] Auto-selected model: {_WORKING_MODEL_NAME}")
                    return _WORKING_MODEL_NAME

        if available:
            _WORKING_MODEL_NAME = available[0]
            logger.info(f"[AI Service] Fallback selected model: {_WORKING_MODEL_NAME}")
            return _WORKING_MODEL_NAME

    except Exception as e:
        logger.warning(f"[AI Service] Dynamic model listing failed: {e}. Using default.")

    _WORKING_MODEL_NAME = "gemini-1.5-flash"
    return _WORKING_MODEL_NAME


def _format_gemini_history(history: Optional[List[Dict[str, str]]]) -> List[Dict[str, Any]]:
    """Converts frontend chat history into Gemini format."""
    if not history:
        return []

    formatted = []
    for h in history:
        raw_role = (h.get("role") or "").lower()
        role = "user" if raw_role == "user" else "model"
        content = (h.get("content") or "").strip()
        if content:
            formatted.append({"role": role, "parts": [content]})

    while formatted and formatted[0]["role"] != "user":
        formatted.pop(0)

    return formatted[-8:]


async def _execute_chat_with_gemini(
    system_instruction: str, message: str, gemini_history: List[Dict[str, Any]]
) -> str:
    """Executes chat session with adequate token budget to ensure complete answers."""
    model_name = _get_working_model_name()
    
    # Adequate token budget (1200 tokens) so replies never cut off mid-sentence
    chat_config = genai.types.GenerationConfig(
        max_output_tokens=1200,
        temperature=0.4,
        top_p=0.9
    )

    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction,
        generation_config=chat_config
    )
    chat = model.start_chat(history=gemini_history)
    response = await chat.send_message_async(message)
    return response.text.strip()


# ============================================================================
# 1. PUBLIC WEBSITE CHATBOT — ConstructONS AI Assist
# ============================================================================

PUBLIC_BOT_SYSTEM_PROMPT = """You are 'ConstructONS AI Assist' — the friendly, expert AI guide for ConstructONS (India's First Integrated Construction Ecosystem).

Persona & Style Rules:
- Warm, confident, professional, and clear.
- Provide complete, well-formed answers. Never cut off mid-sentence.
- Keep responses concise (2 to 4 short paragraphs or bullet points).
- Avoid excessive markdown headers (do NOT use '###', '---', or '***').
- Mention packages start at ₹1,499–₹2,499/sq.ft and suggest taking the 'Find My Package' quiz if asked about pricing."""


async def chat_public_gemini(
    message: str, history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Public Website Chatbot using Gemini."""
    if not _init_gemini():
        return (
            "I'm currently undergoing scheduled maintenance. Please contact"
            " our team at hello@constructons.in or call us directly!"
        )

    try:
        gemini_history = _format_gemini_history(history)
        return await _execute_chat_with_gemini(
            system_instruction=PUBLIC_BOT_SYSTEM_PROMPT,
            message=message,
            gemini_history=gemini_history,
        )
    except Exception as e:
        logger.error(f"[Gemini Public Chat Error]: {e}")
        return (
            "I'm having trouble connecting right now. Feel free to explore our"
            " Home Packages or reach out to our team via the Contact page!"
        )


# ============================================================================
# 2. PORTAL PROJECT ADVISOR — ConstructONS Project Advisor
# ============================================================================


async def chat_portal_gemini(
    message: str,
    project_context: Dict[str, Any],
    history: Optional[List[Dict[str, str]]] = None,
) -> str:
    """Authenticated Client Portal Advisor with Real-Time Project Context."""
    if not _init_gemini():
        return (
            "I am temporarily offline. Please review your project dashboard or"
            " reach out to your assigned Site Engineer."
        )

    try:
        ctx_str = json.dumps(project_context, indent=2, default=str)

        system_instruction = (
            "You are the 'ConstructONS Project Advisor' for this homeowner's active project.\n\n"
            "LIVE PROJECT DATA (AUTHORITATIVE SOURCE OF TRUTH):\n"
            f"```json\n{ctx_str}\n```\n\n"
            "RESPONSE & FORMATTING RULES:\n"
            "1. Be direct, accurate, and helpful.\n"
            "2. Always finish your thoughts cleanly. Do not leave sentences incomplete or truncated.\n"
            "3. NO HEAVY MARKDOWN SLOP: Do NOT use markdown headers ('###'), rules ('---'), or excessive bolding.\n"
            "4. Summarize the user's project status clearly in 2–4 clean sentences or bullet points.\n"
            "5. Never disclose internal contractor costs or other clients' information."
        )

        gemini_history = _format_gemini_history(history)
        return await _execute_chat_with_gemini(
            system_instruction=system_instruction,
            message=message,
            gemini_history=gemini_history,
        )
    except Exception as e:
        logger.error(f"[Gemini Portal Advisor Error]: {e}")
        return (
            "I am having trouble accessing your project records right now."
            " Please refresh the page or check back shortly."
        )


# ============================================================================
# 3. AI COPY REWRITER — Admin CMS Copy Assistant
# ============================================================================

BRAND_SYSTEM_PROMPT = (
    "You are the senior copy chief for ConstructONS — India's premium AI-powered "
    "home construction brand. Voice: confident, transparent, trustworthy, warm; "
    "never salesy or hype-y. Audience: aspirational Indian homeowners (30-55) "
    "who value quality, on-time delivery and no hidden costs.\n\n"
    "Given a piece of copy and an optional purpose (e.g. 'tagline', 'faq answer', "
    "'description'), return exactly 3 improved rewrites. Rules:\n"
    "1. Keep the same meaning and factual claims — do NOT invent features.\n"
    "2. Vary sentence length; prefer active voice.\n"
    "3. For taglines, cap at 8 words.\n"
    "4. Never mention competitors by name.\n"
    "5. Never use words like 'revolutionary', 'game-changer', 'cutting-edge'.\n\n"
    "Return STRICT JSON only in this shape (no markdown, no prose):\n"
    '{"suggestions": ["rewrite 1", "rewrite 2", "rewrite 3"]}'
)


async def rewrite_copy(text: str, purpose: str = "copy", tone: str = "on-brand") -> List[str]:
    """Return a list of 3 rewrite suggestions via Gemini."""
    if not _init_gemini():
        return []

    prompt = (
        f"Purpose: {purpose}\n"
        f"Tone hint: {tone}\n"
        f"Original copy:\n---\n{text.strip()}\n---\n\n"
        "Return the JSON as instructed."
    )

    try:
        model_name = _get_working_model_name()
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=BRAND_SYSTEM_PROMPT,
        )
        response = await model.generate_content_async(prompt)
        raw = response.text.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return []
        parsed = json.loads(match.group(0))
        suggestions = parsed.get("suggestions") or []
        cleaned = []
        seen = set()
        for s in suggestions:
            if isinstance(s, str) and s.strip() and s.strip() not in seen:
                seen.add(s.strip())
                cleaned.append(s.strip())
            if len(cleaned) >= 3:
                break
        return cleaned
    except Exception as e:
        logger.error(f"[Gemini Copy Rewrite Error]: {e}")
        return []


# ============================================================================
# 4. CUSTOM QUOTE AI SUGGESTION — Admin Quotation Engine
# ============================================================================

QUOTE_SYSTEM_PROMPT = (
    "You are a senior estimator at ConstructONS — a premium Indian home "
    "construction brand. Given client requirements, produce a realistic, "
    "buildable, budget-aligned custom quotation as STRICT JSON.\n\n"
    "PRICING RULES (critical):\n"
    "• A flat 15% contractor service charge is added on top of ALL items "
    "  (base + addons + interiors + line items). NEVER include GST.\n"
    "• If a budget is given, target: budget = pre_service_total × 1.15. "
    "  So pre_service_total ≈ budget / 1.15. Tune price_per_sqft, addons, "
    "  interiors and line_items to land within ±6%.\n"
    "• Legal rates: price_per_sqft ∈ [1300, 3500]. Total base = built_up × rate.\n"
    "• Use well-known Indian brands (UltraTech, TATA Tiscon, Kamdhenu, JSW, "
    "  Jaquar, Kohler, Asian Paints, Berger, Havells, Kajaria, Somany, "
    "  Godrej Interio, Sleek, Hettich, Blum, Philips, Syska).\n\n"
    "OUTPUT SHAPE (STRICT JSON, no markdown):\n"
    "{\n"
    '  "package_name": string,\n'
    '  "price_per_sqft": number,\n'
    '  "spec_categories": [\n'
    '    {"name": string, "icon": string|null, "items": [\n'
    '      {"spec": string, "value": string, "brand": string|null,\n'
    '       "warranty": string|null, "notes": string|null,\n'
    '       "rate": number, "rate_unit": string|null}\n'
    "    ]}\n"
    "  ],\n"
    '  "interiors": [\n'
    '    {"name": string, "icon": string|null, "items": [\n'
    '      {"spec": string, "value": string, "brand": string|null,\n'
    '       "notes": string|null, "rate": number, "rate_unit": string|null,\n'
    '       "include_in_total": true}\n'
    "    ]}\n"
    "  ],\n"
    '  "addons": [{"name": string, "description": string, "price": number, "unit": string|null}],\n'
    '  "line_items": [{"name": string, "description": string, "amount": number}],\n'
    '  "scope_of_work": [string],\n'
    '  "exclusions": [string],\n'
    '  "payment_schedule": [{"milestone": string, "percentage": number, "description": string}],\n'
    '  "warranty_years": number,\n'
    '  "ai_notes": string\n'
    "}\n\n"
    "CONSTRAINTS to keep responses fast: "
    "6–8 spec_categories, 4–6 items each; 3–5 interior categories with 3–5 items; "
    "3–6 addons; 0–3 line_items; 6–8 milestones."
)


async def suggest_custom_quote(payload: dict) -> dict:
    """Return a full custom-quote draft using Gemini based on client requirements."""
    if not _init_gemini():
        return {}

    mode = (payload.get("mode") or "recommend").strip().lower()
    if mode not in ("recommend", "scratch"):
        mode = "recommend"

    base_pkg = payload.get("base_package") or {}
    base_summary = ""
    if base_pkg:
        cats = base_pkg.get("spec_categories") or []
        base_summary = (
            f"\nBase package to anchor: '{base_pkg.get('name','?')}' "
            f"({base_pkg.get('price_display','?')}), {len(cats)} spec cats. "
            "In 'ai_notes', explain the upgrades/downgrades vs this baseline."
        )

    budget = payload.get("budget")
    budget_line = ""
    if budget:
        target_pre = float(budget) / 1.15
        budget_line = (
            f"\nBUDGET ANCHOR: client budget = ₹{float(budget):,.0f}. "
            f"Aim pre-service total ≈ ₹{target_pre:,.0f}. Grand = pre × 1.15."
        )

    user_prompt = (
        f"Mode: {mode}\n"
        "Client requirements:\n"
        f"- Built-up area: {payload.get('built_up_area') or 1200} sq.ft\n"
        f"- Plot area: {payload.get('plot_area') or 'not specified'} sq.ft\n"
        f"- Floors: {payload.get('floors') or 'G+1'}\n"
        f"- BHK: {payload.get('bhk') or 'not specified'}\n"
        f"- Style: {payload.get('style_pref') or 'Modern'}"
        f"{budget_line}{base_summary}\n\n"
        "Return the JSON payload exactly as specified — no prose, no markdown."
    )

    try:
        model_name = _get_working_model_name()
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=QUOTE_SYSTEM_PROMPT,
        )
        response = await model.generate_content_async(user_prompt)
        raw = response.text.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return {}
        parsed = json.loads(match.group(0))

        def _list(x):
            return x if isinstance(x, list) else []

        def _normalise_categories(raw_cats, mark_include=False):
            out = []
            for cat in _list(raw_cats)[:12]:
                if not isinstance(cat, dict):
                    continue
                items = []
                for it in _list(cat.get("items"))[:20]:
                    if not isinstance(it, dict):
                        continue
                    try:
                        rate = float(it.get("rate") or 0)
                    except Exception:
                        rate = 0.0
                    items.append({
                        "spec": str(it.get("spec") or "")[:120],
                        "value": str(it.get("value") or "")[:400],
                        "brand": (str(it.get("brand"))[:120] if it.get("brand") else None),
                        "warranty": (str(it.get("warranty"))[:80] if it.get("warranty") else None),
                        "notes": (str(it.get("notes"))[:220] if it.get("notes") else None),
                        "rate": max(0.0, rate),
                        "rate_unit": (str(it.get("rate_unit"))[:40] if it.get("rate_unit") else None),
                        "include_in_total": bool(it.get("include_in_total")) or mark_include,
                    })
                if items:
                    out.append({
                        "name": str(cat.get("name") or "Category")[:80],
                        "icon": (str(cat.get("icon"))[:40] if cat.get("icon") else None),
                        "items": items,
                    })
            return out

        out: dict = {}
        out["package_name"] = str(parsed.get("package_name") or "Custom Home")[:120]
        try:
            rate = float(parsed.get("price_per_sqft") or 0)
            out["price_per_sqft"] = max(1000.0, min(4000.0, rate)) if rate else 0.0
        except Exception:
            out["price_per_sqft"] = 0.0

        out["spec_categories"] = _normalise_categories(parsed.get("spec_categories"))
        out["interiors"] = _normalise_categories(parsed.get("interiors"), mark_include=True)

        addons = []
        for a in _list(parsed.get("addons"))[:20]:
            if not isinstance(a, dict):
                continue
            try:
                price = float(a.get("price") or 0)
            except Exception:
                price = 0.0
            addons.append({
                "name": str(a.get("name") or "Add-on")[:120],
                "description": str(a.get("description") or "")[:300],
                "price": max(0.0, price),
                "unit": (str(a.get("unit"))[:40] if a.get("unit") else None),
            })
        out["addons"] = addons

        lines = []
        for l in _list(parsed.get("line_items"))[:20]:
            if not isinstance(l, dict):
                continue
            try:
                amt = float(l.get("amount") or 0)
            except Exception:
                amt = 0.0
            lines.append({
                "name": str(l.get("name") or "Item")[:120],
                "description": str(l.get("description") or "")[:300],
                "amount": max(0.0, amt),
            })
        out["line_items"] = lines

        out["scope_of_work"] = [str(s)[:220] for s in _list(parsed.get("scope_of_work"))[:30] if s]
        out["exclusions"] = [str(s)[:220] for s in _list(parsed.get("exclusions"))[:30] if s]

        sched = []
        for s in _list(parsed.get("payment_schedule"))[:12]:
            if not isinstance(s, dict):
                continue
            try:
                pct = float(s.get("percentage") or 0)
            except Exception:
                pct = 0.0
            sched.append({
                "milestone": str(s.get("milestone") or "Milestone")[:80],
                "percentage": max(0.0, min(100.0, pct)),
                "description": str(s.get("description") or "")[:200],
            })
        out["payment_schedule"] = sched

        try:
            out["warranty_years"] = int(parsed.get("warranty_years") or 10)
        except Exception:
            out["warranty_years"] = 10

        out["ai_notes"] = str(parsed.get("ai_notes") or "")[:2000]
        out["ai_mode"] = mode
        out["service_charge_percent"] = 15
        out["gst_percent"] = 0
        return out
    except Exception as e:
        logger.error(f"[Gemini Custom Quote Error]: {e}")
        return {}