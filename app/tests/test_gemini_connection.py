from gemini_client import GEMINI_MODEL, gemini_client

def test_gemini_connection() -> None:
    if gemini_client is None:
        raise RuntimeError(
            "Cannot test Gemini: GEMINI_API_KEY is missing"
        )

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=(
            "Reply with exactly this sentence: "
            "Gemini connection successful."
        ),
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned no text response"
        )
    print(response.text)

if __name__ == "__main__":
    test_gemini_connection()