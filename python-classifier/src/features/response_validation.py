"""Response Validation"""

from typing import Dict, List


def validate_gemini_response(
    response: List[Dict], valid_types: List[str]
) -> List[Dict]:
    """Valideer en filter Gemini response"""
    return [
        item
        for item in response
        if (
            isinstance(item.get("type"), str)
            and isinstance(item.get("confidence"), (int, float))
            and item["type"] in valid_types
            and 0.0 <= item["confidence"] <= 1.0
        )
    ]
