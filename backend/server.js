const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Debug: Check if API key is loaded
console.log('Environment variables loaded:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'NOT LOADED');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT LOADED');
console.log('PORT:', process.env.PORT || 'NOT LOADED');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://vercel.app',
    'https://*.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'AI Recipe Generator Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipe_generator'
};

let db;

// Initialize database connection
async function initDatabase() {
  try {
    // First connect without specifying a database
    const tempDb = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await tempDb.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database '${dbConfig.database}' created or already exists`);
    
    // Close temporary connection
    await tempDb.end();
    
    // Now connect to the specific database
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to recipe_generator database');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create recipes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ingredients TEXT NOT NULL,
        recipe TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recipe Routes

// Get user's recipes
app.get('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const [recipes] = await db.execute(
      'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(recipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save recipe
app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { ingredients, recipe } = req.body;

    if (!ingredients || !recipe) {
      return res.status(400).json({ error: 'Ingredients and recipe are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO recipes (user_id, ingredients, recipe) VALUES (?, ?, ?)',
      [req.user.userId, ingredients, recipe]
    );

    res.status(201).json({
      message: 'Recipe saved successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;

    const [result] = await db.execute(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?',
      [recipeId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all recipes
app.delete('/api/recipes', authenticateToken, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM recipes WHERE user_id = ?',
      [req.user.userId]
    );

    res.json({ message: 'All recipes cleared successfully' });
  } catch (error) {
    console.error('Clear recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recipe generation endpoint
app.post('/api/generate-recipe', authenticateToken, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    console.log(`Generating recipe for ingredients: ${ingredients}`);
    console.log(`API Key loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);

    // Create a clear prompt for Gemini
    const prompt = `Create a delicious and practical recipe using these ingredients: ${ingredients}

Please provide:
1. A recipe title
2. Complete ingredients list (including basic seasonings if needed)  
3. Clear step-by-step cooking instructions
4. Estimated cooking time

Make it a realistic, cookable recipe that someone could actually make.`;

    // Generate recipe using Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedRecipe = response.text();

    console.log(`Recipe generated successfully: ${generatedRecipe.length} characters`);

    // Automatically save the generated recipe
    const [dbResult] = await db.execute(
      'INSERT INTO recipes (user_id, ingredients, recipe) VALUES (?, ?, ?)',
      [req.user.userId, ingredients, generatedRecipe]
    );

    res.json({
      recipe: generatedRecipe,
      saved: true,
      recipeId: dbResult.insertId
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    res.status(500).json({ error: `Error generating recipe: ${error.message}` });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('API test endpoint called');
  res.json({ 
    message: 'Backend server is running!', 
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Not Connected',
    cors: 'Enabled'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({
    status: 'OK',
    server: 'Running',
    database: db ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and start server
async function startServer() {
  console.log('Starting server...');
  
  // Try to initialize database
  const dbConnected = await initDatabase();
  
  if (dbConnected) {
    console.log('Database initialized successfully');
  } else {
    console.log('Database connection failed, but starting server anyway');
  }
  
  // Start the server regardless of database status
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`Test the API at: http://localhost:${PORT}/api/test`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`CORS enabled for all origins`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
