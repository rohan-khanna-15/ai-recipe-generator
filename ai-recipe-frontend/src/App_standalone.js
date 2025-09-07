import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipeHistory, setRecipeHistory] = useState([]);

  // Load recipe history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('recipeHistory');
    if (savedHistory) {
      try {
        setRecipeHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load recipe history:', error);
        localStorage.removeItem('recipeHistory');
      }
    }
  }, []);

  // Save recipe history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recipeHistory', JSON.stringify(recipeHistory));
  }, [recipeHistory]);

  const generateRecipeWithGemini = async (ingredientsList) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.');
    }

    const prompt = `Create a detailed recipe using these ingredients: ${ingredientsList}

Please provide:
1. Recipe name
2. Cooking time
3. Difficulty level
4. Complete ingredient list with quantities
5. Step-by-step cooking instructions
6. Any helpful cooking tips

Format the response in a clear, easy-to-read manner.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid API key or API access denied. Please check your Gemini API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim() || ingredients.trim().length < 3) {
      setError('Please enter at least 3 characters of ingredients.');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe('');

    try {
      const generatedRecipe = await generateRecipeWithGemini(ingredients.trim());
      setRecipe(generatedRecipe);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        ingredients: ingredients.trim(),
        recipe: generatedRecipe,
        timestamp: new Date().toISOString()
      };
      
      setRecipeHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep only last 10 recipes
      
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setIngredients('');
    setRecipe('');
    setError('');
  };

  const loadFromHistory = (historyItem) => {
    setIngredients(historyItem.ingredients);
    setRecipe(historyItem.recipe);
  };

  const clearHistory = () => {
    setRecipeHistory([]);
    localStorage.removeItem('recipeHistory');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="app-layout">
      {/* Sidebar for History */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Recipe History</h2>
          {recipeHistory.length > 0 && (
            <button className="clear-history-btn" onClick={clearHistory}>
              Clear All
            </button>
          )}
        </div>
        
        <div className="history-list">
          {recipeHistory.length === 0 ? (
            <div className="no-history">
              <p>No recipes yet. Generate your first recipe!</p>
            </div>
          ) : (
            recipeHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-ingredients">
                  {item.ingredients.length > 50 
                    ? `${item.ingredients.substring(0, 50)}...` 
                    : item.ingredients}
                </div>
                <div className="history-timestamp">{formatTimestamp(item.timestamp)}</div>
                <button 
                  className="load-recipe-btn"
                  onClick={() => loadFromHistory(item)}
                >
                  Load Recipe
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="container">
          <h1>🍳 AI Recipe Generator</h1>
          <p className="subtitle">Enter your ingredients and let AI create amazing recipes for you!</p>
          
          {!process.env.REACT_APP_GEMINI_API_KEY && (
            <div className="api-key-warning">
              <p><strong>⚠️ Setup Required:</strong> To use this app, you need to:</p>
              <ol>
                <li>Get a free Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                <li>Add it as <code>REACT_APP_GEMINI_API_KEY</code> in your environment variables</li>
              </ol>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <textarea
              rows="4"
              placeholder="Enter ingredients separated by commas (e.g., chicken, rice, onions, garlic, tomatoes)"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              disabled={loading}
              required
            />
            <div className="button-group">
              <button type="submit" className="generate" disabled={loading || !process.env.REACT_APP_GEMINI_API_KEY}>
                {loading ? 'Generating...' : '🍳 Generate Recipe'}
              </button>
              <button type="button" className="clear" onClick={handleClear} disabled={loading}>
                🗑️ Clear
              </button>
            </div>
          </form>

          {error && (
            <div className="error-container">
              <p className="error">❌ {error}</p>
            </div>
          )}

          {recipe && (
            <div className="recipe-container">
              <h3>🎉 Generated Recipe:</h3>
              <div className="recipe-content">
                {recipe.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
