import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';

function RecipeApp() {
  const { user, logout, getAuthHeaders } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipeHistory, setRecipeHistory] = useState([]);

  // Load recipe history from backend when user logs in
  useEffect(() => {
    if (user) {
      loadRecipeHistory();
    }
  }, [user]);

  // Load recipes from backend
  const loadRecipeHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const recipes = await response.json();
        setRecipeHistory(recipes);
      }
    } catch (error) {
      console.error('Failed to load recipe history:', error);
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
      const response = await fetch('http://localhost:5000/api/generate-recipe', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ingredients: ingredients.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
        // Recipe is automatically saved by the backend
        loadRecipeHistory();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate recipe');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
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

  const clearHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setRecipeHistory([]);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setRecipe('');
    setIngredients('');
    setRecipeHistory([]);
    setError('');
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
          <div className="user-info">
            <span>Welcome, {user.name}!</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
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
                <div className="history-timestamp">{formatTimestamp(item.created_at)}</div>
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
          <h1>AI Recipe Generator</h1>
          
          <form onSubmit={handleSubmit}>
            <textarea
              rows="4"
              placeholder="Enter ingredients separated by commas"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              disabled={loading}
              required
            />
            <div>
              <button type="submit" className="generate" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Recipe'}
              </button>
              <button type="button" className="clear" onClick={handleClear} disabled={loading}>
                Clear
              </button>
            </div>
          </form>

          {error && <p className="error">{error}</p>}

          {recipe && (
            <div className="recipe-container">
              <h3>Generated Recipe:</h3>
              <p>{recipe}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return isAuthenticated() ? <RecipeApp /> : <Auth />;
}

export default App;
