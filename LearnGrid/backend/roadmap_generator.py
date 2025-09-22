import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found. Please set it in the .env file.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Error configuring Generative AI: {e}")
    model = None

def generate_ai_roadmap(skill):
    """
    Uses the Gemini API to generate a learning roadmap with multiple resource types.
    """
    if not model:
        return {"error": "Generative AI model is not configured. Check API key."}

    # UPDATED PROMPT: Asks for a richer resources object
    prompt = f"""
    You are an expert curriculum designer. Generate a step-by-step learning roadmap for the skill: "{skill}".
    Break it down into logical modules and sub-topics.
    For each sub-topic, provide a resources object containing simple search queries for YouTube, Coursera, Udemy, and a relevant type of article.

    Provide the output ONLY in a valid JSON format, following this structure:
    {{
      "skill": "{skill}",
      "modules": [
        {{
          "title": "Module 1: ...",
          "subtopics": [
            {{
              "title": "Sub-topic Title",
              "resources": {{
                "youtube": "YouTube Search Query",
                "udemy": "Udemy Course Search Query",
                "coursera": "Coursera Course Search Query",
                "articles": "Technical Article Search Query"
              }}
            }}
          ]
        }}
      ]
    }}
    
    Do not include any text, explanation, or markdown formatting before or after the JSON object.
    """
    try:
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"An error occurred during AI roadmap generation: {e}")
        return {"error": f"Could not generate AI roadmap for '{skill}'."}


def generate_quiz(topic):
    """
    NEW FUNCTION: Uses the Gemini API to generate a single quiz question.
    """
    if not model:
        return {"error": "Generative AI model is not configured. Check API key."}

    # NEW PROMPT: Asks for a quiz question in a specific JSON format
    prompt = f"""
    You are a quiz designer. Create a single, simple multiple-choice question to test a beginner's knowledge on the topic: "{topic}".
    The question should have 4 options, with one being the correct answer.

    Provide the output ONLY in a valid JSON format like this:
    {{
      "question": "The question text?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "The correct option text"
    }}

    Do not include any text, explanation, or markdown formatting before or after the JSON object.
    """
    try:
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"An error occurred during AI quiz generation: {e}")
        return {"error": f"Could not generate quiz for '{topic}'."}