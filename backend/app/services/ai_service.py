"""
AI Service — KalaSaarthi
Uses Google Gemini API if AI_API_KEY is set, otherwise falls back to smart rule-based logic.
SDK: google-genai (new, supported). Client is initialised ONCE at import time for efficiency.
"""
import os
import json
import re

AI_API_KEY = os.getenv("AI_API_KEY", "")

# ── Module-level singleton client (initialised once, reused every request) ──
_genai_client = None

def _get_client():
    """Return the singleton google.genai Client, creating it on first call."""
    global _genai_client
    if _genai_client is not None:
        return _genai_client
    if not AI_API_KEY:
        return None
    try:
        from google import genai
        _genai_client = genai.Client(api_key=AI_API_KEY)
        return _genai_client
    except Exception:
        return None

# Model to use for all text + audio tasks.
# gemini-3.8-flash is available on the free tier for this key.
_MODEL = "gemini-3.8-flash"

def _call_gemini(prompt: str) -> str:
    """Call Gemini with a text-only prompt. Returns response text."""
    client = _get_client()
    if not client:
        raise RuntimeError("Gemini client not available — AI_API_KEY missing.")
    from google.genai import types
    response = client.models.generate_content(
        model=_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.0)
    )
    return response.text.strip()

def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a Gemini response."""
    # Strip markdown code fences
    text = re.sub(r"```(?:json)?", "", text).strip().strip("`").strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return {}


class AIService:

    # ─────────────────────────── Image analysis ─────────────────────────────

    @staticmethod
    def analyze_image(image_bytes: bytes) -> dict:
        """OpenCV-based image analysis: blur, brightness, contrast."""
        try:
            import cv2
            import numpy as np

            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image")

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Laplacian variance — sharpness
            blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            is_blurry = bool(blur_score < 100)

            # Mean brightness (0–255)
            brightness = float(np.mean(gray))
            is_dark = bool(brightness < 80)
            is_overexposed = bool(brightness > 210)

            # Contrast via std deviation
            contrast = float(np.std(gray))
            low_contrast = bool(contrast < 30)

            # Build score out of 100
            score = 100
            issues = []
            if is_blurry:
                score -= 30
                issues.append("Image appears blurry. Hold the camera steady and ensure good focus.")
            if is_dark:
                score -= 25
                issues.append("Image is too dark. Try photographing near a window or in natural light.")
            if is_overexposed:
                score -= 20
                issues.append("Image is overexposed. Avoid direct bright light or flash.")
            if low_contrast:
                score -= 15
                issues.append("Low contrast — the product may not stand out clearly from the background.")

            score = max(score, 10)
            recommendation = " ".join(issues) if issues else "Great image quality! Your product looks clear and well-lit."

            return {
                "score": round(score),
                "needs_attention": score < 70,
                "recommendation": recommendation,
                "details": {
                    "blur_score": round(blur_score, 1),
                    "brightness": round(brightness, 1),
                    "contrast": round(contrast, 1),
                    "is_blurry": is_blurry,
                    "is_dark": is_dark,
                    "is_overexposed": is_overexposed,
                }
            }
        except Exception:
            # Fallback
            return {
                "score": 75,
                "needs_attention": False,
                "recommendation": "Image uploaded successfully.",
                "details": {}
            }

    @staticmethod
    def enhance_image(image_bytes: bytes) -> bytes:
        """Apply simple brightness/contrast enhancement with OpenCV."""
        try:
            import cv2
            import numpy as np

            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return image_bytes

            # CLAHE for adaptive contrast
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            lab = cv2.merge((l, a, b))
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

            _, buffer = cv2.imencode(".jpg", enhanced, [cv2.IMWRITE_JPEG_QUALITY, 90])
            return buffer.tobytes()
        except Exception:
            return image_bytes

    # ──────────────────────────── Catalogue AI ──────────────────────────────

    @staticmethod
    def generate_catalog(description: str, image_url: str = "") -> dict:
        """Generate structured product catalogue from description using Gemini."""

        if AI_API_KEY:
            prompt = f"""You are a product listing assistant for Indian artisan handicrafts.

The artisan described their product in their own words:
"{description}"

Your task: convert this description into a structured JSON product listing.
You must NOT invent, add, or assume ANY detail that is not present in the description above.

STRICT RULES (violations are unacceptable):
- "name": derive only from what the artisan said. Do NOT add brand names, character names, or cultural claims they did not mention.
- "category": pick the closest match from: Textiles, Pottery, Jewelry, Woodwork, Metalwork, Painting, Weaving, Embroidery, Leather, Other.
- "description": rephrase the artisan's own words professionally. Do NOT add extra features, certifications, or origin claims.
- "materials": list only materials the artisan explicitly mentioned. If none were mentioned, use "Natural materials".
- "color": only colors the artisan mentioned. If none, use "".
- "tags": 5–8 search-relevant keywords drawn from the description.
- If a field cannot be determined from the description, leave it as an empty string — do NOT guess.
- Do NOT include any character names, brand names, pop culture references, or fictional entities.

Return ONLY a valid JSON object with no markdown fencing, no explanation:
{{
  "name": "...",
  "category": "...",
  "description": "...",
  "materials": "...",
  "color": "...",
  "tags": "..."
}}"""

            try:
                raw = _call_gemini(prompt)
                data = _extract_json(raw)
                if data.get("name"):
                    return data
            except Exception:
                pass  # Fall through to rule-based

        # ── Rule-based fallback ──
        desc_lower = description.lower()

        # Category detection
        category = "Handicrafts"
        cat_map = {
            "Textiles": ["saree", "sari", "fabric", "cloth", "textile", "weave", "woven", "cotton", "silk", "linen", "dupatta", "kurta"],
            "Pottery": ["pot", "clay", "ceramic", "terracotta", "earthen", "vessel"],
            "Jewelry": ["jewel", "necklace", "bangle", "ring", "earring", "bracelet", "pendant"],
            "Woodwork": ["wood", "wooden", "carved", "carving", "furniture", "teak", "mango wood"],
            "Metalwork": ["brass", "copper", "silver", "metal", "iron", "bronze", "steel"],
            "Painting": ["paint", "painting", "art", "canvas", "portrait", "madhubani", "warli", "miniature"],
            "Weaving": ["weave", "loom", "handloom", "woven", "thread"],
            "Embroidery": ["embroider", "stitch", "kantha", "chikan", "phulkari", "needlework"],
        }
        for cat, keywords in cat_map.items():
            if any(kw in desc_lower for kw in keywords):
                category = cat
                break

        # Materials extraction
        material_keywords = ["cotton", "silk", "wool", "leather", "clay", "wood", "brass", "copper", "silver", "gold", "bamboo", "jute", "linen", "terracotta"]
        found_materials = [m.capitalize() for m in material_keywords if m in desc_lower]
        materials = ", ".join(found_materials) if found_materials else "Natural materials"

        # Color extraction
        color_keywords = ["red", "blue", "green", "yellow", "white", "black", "orange", "purple", "pink", "brown", "golden", "silver", "multicolor"]
        found_colors = [c.capitalize() for c in color_keywords if c in desc_lower]
        color = ", ".join(found_colors) if found_colors else "Multicolor"

        # Name: build from category + key material + craft noun
        craft_nouns = {
            "Textiles": "Saree", "Weaving": "Saree", "Pottery": "Pottery",
            "Jewelry": "Jewelry", "Woodwork": "Carving", "Metalwork": "Craft",
            "Painting": "Art", "Embroidery": "Embroidery", "Handicrafts": "Craft"
        }
        craft_noun = craft_nouns.get(category, "Creation")
        material_word = found_materials[0] if found_materials else ""
        color_word = found_colors[0] if found_colors else ""
        parts = [p for p in [color_word, material_word, "Hand-crafted", craft_noun] if p]
        name = " ".join(parts[:4])

        return {
            "name": name,
            "category": category,
            "description": f"This is a handcrafted {category.lower()} item. {description[:200]}",
            "materials": materials,
            "color": color,
            "tags": f"handmade, artisan, {category.lower()}, Indian craft, traditional, authentic",
        }


    @staticmethod
    def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str:
        """
        Transcribe audio using Gemini.

        Returns the transcript as plain text.
        Returns empty string if no speech is detected (caller should show retry UI).
        Raises RuntimeError on hard failures.

        Anti-hallucination measures:
        - Validates minimum audio size (< 1 KB is almost certainly empty/silent)
        - Uses temperature=0 so the model does not improvise
        - Uses a strict prompt that explicitly forbids inventing content
        - Post-processes response to detect known silence/noise patterns
        """
        if not AI_API_KEY:
            raise RuntimeError("Voice transcription is not configured. Please use text input.")

        # ── Guard: reject payloads that are too small to contain real speech ──
        MIN_AUDIO_BYTES = 1024  # < 1 KB = browser header only, no real audio
        if len(audio_bytes) < MIN_AUDIO_BYTES:
            return ""  # Caller displays "no speech detected" UI

        client = _get_client()
        if not client:
            raise RuntimeError("AI client could not be initialised.")

        from google.genai import types

        # Strict transcription-only prompt. Explicit list of forbidden behaviours.
        TRANSCRIPTION_PROMPT = (
            "You are a strict audio transcription system. Your ONLY job is to "
            "output the exact words spoken in the audio, verbatim, with no "
            "additions, no summaries, and no interpretation.\n\n"
            "RULES:\n"
            "- Output ONLY the spoken words, nothing else.\n"
            "- Do NOT add punctuation that was not in the speech.\n"
            "- Do NOT invent, guess, or embellish any words.\n"
            "- Do NOT describe sounds, music, or background noise.\n"
            "- Do NOT answer questions that appear in the audio.\n"
            "- If the audio is silent, inaudible, or contains only noise, "
            "output exactly the single token: <UNCLEAR>\n"
            "- Preserve the original language (Hindi or English).\n\n"
            "Audio to transcribe:"
        )

        try:
            response = client.models.generate_content(
                model=_MODEL,
                contents=[
                    TRANSCRIPTION_PROMPT,
                    types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                ],
                config=types.GenerateContentConfig(temperature=0.0),
            )

            raw = response.text.strip() if response.text else ""

            # ── Post-process: treat known silence/noise markers as empty ──
            SILENCE_MARKERS = {"<unclear>", "(no speech detected)", "(silence)", "(background noise)", ""}
            if raw.lower() in SILENCE_MARKERS or raw.startswith("<UNCLEAR"):
                return ""  # Empty string → frontend shows retry UI

            return raw

        except Exception as e:
            raise RuntimeError(f"Transcription failed: {e}")


    # ──────────────────────────── Smart Pricing ─────────────────────────────

    @staticmethod
    def recommend_price(materials: str, production_time: str, category: str, description: str = "") -> dict:
        """
        Smart rule-based pricing with optional Gemini enhancement.
        Returns suggested range + recommended price + breakdown.
        """
        if AI_API_KEY:
            prompt = f"""You are a pricing expert for Indian artisan handicrafts.
Given the following product details, suggest a fair market price in INR.

Category: {category}
Materials: {materials}
Production Time: {production_time}
Description: {description}

Return ONLY a valid JSON object with NO markdown formatting, NO extra text:
{{
  "recommended": 1500,
  "suggested_min": 1200,
  "suggested_max": 2000,
  "explanation": "Brief 1-2 sentence explanation of why this price is fair based on materials and labor."
}}
"""
            try:
                raw = _call_gemini(prompt)
                data = _extract_json(raw)
                if data.get("recommended") and data.get("explanation"):
                    return data
            except Exception:
                pass # Fall back to rule-based logic
        # ── Base price per category ──
        base_by_category = {
            "Textiles": 2000, "Pottery": 800, "Jewelry": 2500, "Woodwork": 3000,
            "Metalwork": 2500, "Painting": 4000, "Weaving": 1800,
            "Embroidery": 1500, "Leather": 2000, "Handicrafts": 1200, "Other": 1000,
        }
        base = base_by_category.get(category, 1200)

        # ── Material cost multiplier ──
        material_multipliers = {
            "silk": 1.8, "gold": 2.5, "silver": 1.6, "leather": 1.4,
            "wool": 1.3, "brass": 1.2, "copper": 1.2, "cotton": 1.0,
            "clay": 0.8, "bamboo": 0.9, "jute": 0.85,
        }
        mat_lower = materials.lower()
        mat_mult = 1.0
        for mat, mult in material_multipliers.items():
            if mat in mat_lower:
                mat_mult = max(mat_mult, mult)

        # ── Labour (production time) ──
        time_mult = 1.0
        if production_time:
            time_lower = production_time.lower()
            if any(x in time_lower for x in ["week", "7 day", "10 day"]):
                time_mult = 1.5
            elif any(x in time_lower for x in ["month", "30 day"]):
                time_mult = 2.0
            elif any(x in time_lower for x in ["day", "2 day", "3 day"]):
                time_mult = 1.2
            elif any(x in time_lower for x in ["hour", "few hour"]):
                time_mult = 1.0

        recommended = round(base * mat_mult * time_mult / 50) * 50  # round to nearest 50
        min_price = round(recommended * 0.8 / 50) * 50
        max_price = round(recommended * 1.3 / 50) * 50

        breakdown = []
        breakdown.append(f"Base price for {category}: ₹{base}")
        if mat_mult > 1.0:
            breakdown.append(f"Material premium ({materials}): +{round((mat_mult-1)*100)}%")
        if time_mult > 1.0:
            breakdown.append(f"Labour/time adjustment: +{round((time_mult-1)*100)}%")

        explanation = ". ".join(breakdown) + ". Final price reflects craft complexity and material value."

        return {
            "recommended": recommended,
            "suggested_min": min_price,
            "suggested_max": max_price,
            "explanation": explanation,
            "breakdown": {
                "base": base,
                "material_multiplier": round(mat_mult, 2),
                "time_multiplier": round(time_mult, 2),
            }
        }

    # ──────────────────────────── Product Health ─────────────────────────────

    @staticmethod
    def calculate_health(product: dict) -> dict:
        """Simple deterministic product health score + recommendations."""
        score = 100
        recs = []

        if not product.get("name"):
            score -= 20; recs.append({"type": "error", "icon": "tag", "text": "Add a product name"})
        if not product.get("description") or len(product.get("description", "")) < 50:
            score -= 20; recs.append({"type": "warning", "icon": "file-text", "text": "Improve the product description (aim for 50+ words)"})
        if not product.get("images"):
            score -= 25; recs.append({"type": "error", "icon": "image", "text": "Upload a product photo"})
        if not product.get("final_price"):
            score -= 15; recs.append({"type": "warning", "icon": "dollar-sign", "text": "Set a price to attract buyers"})
        if not product.get("materials"):
            score -= 10; recs.append({"type": "info", "icon": "layers", "text": "List the materials used"})
        if not product.get("tags"):
            score -= 10; recs.append({"type": "info", "icon": "hash", "text": "Add search tags to improve discoverability"})

        score = max(score, 0)
        if score >= 80:
            label, color = "Excellent", "green"
        elif score >= 60:
            label, color = "Good", "blue"
        elif score >= 40:
            label, color = "Needs Work", "yellow"
        else:
            label, color = "Incomplete", "red"

        return {"score": score, "label": label, "color": color, "recommendations": recs}
