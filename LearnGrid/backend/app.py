from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from roadmap_generator import generate_ai_roadmap

app = Flask(__name__)
# Allow requests from your frontend (CORS)
CORS(app) 

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    # Get the 'skill' from the URL query (e.g., ?skill=python)
    skill = request.args.get('skill', '').lower().strip()
    if not skill:
        return jsonify({"error": "Skill parameter is required."}), 400

    # --- MVP Approach: Check for a predefined roadmap first ---
    try:
        predefined_path = os.path.join('predefined_roadmaps', f'{skill}.json')
        if os.path.exists(predefined_path):
            with open(predefined_path, 'r') as f:
                print(f"Serving predefined roadmap for: {skill}")
                return jsonify(json.load(f))
    except Exception as e:
        print(f"Error reading predefined file: {e}")

    # --- If no predefined map, use the AI Generator ---
    print(f"Generating AI roadmap for: {skill}")
    ai_generated_roadmap = generate_ai_roadmap(skill)
    
    # Check if the AI generation resulted in an error
    if "error" in ai_generated_roadmap:
        return jsonify(ai_generated_roadmap), 500
        
    return jsonify(ai_generated_roadmap)

if __name__ == '__main__':
    # This runs the server when you execute `python app.py`
    # It will be accessible at http://127.0.0.1:5000
    app.run(debug=True, port=5000)