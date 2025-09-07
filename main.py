from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development allow all origins; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')  # Using the correct model name

class IngredientsRequest(BaseModel):
    ingredients: str

@app.post("/generate-recipe")
async def generate_recipe(request: IngredientsRequest):
    if not request.ingredients or request.ingredients.strip() == "":
        raise HTTPException(status_code=400, detail="Ingredients are required.")

    # Create a clear prompt for Gemini
    prompt = f"""Create a delicious and practical recipe using these ingredients: {request.ingredients}

Please provide:
1. A recipe title
2. Complete ingredients list (including basic seasonings if needed)  
3. Clear step-by-step cooking instructions
4. Estimated cooking time

Make it a realistic, cookable recipe that someone could actually make."""

    try:
        # Generate recipe using Gemini
        print(f"Generating recipe for ingredients: {request.ingredients}")
        print(f"API Key loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
        
        response = model.generate_content(prompt)
        recipe = response.text
        
        print(f"Recipe generated successfully: {len(recipe)} characters")
        return {"recipe": recipe}

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
