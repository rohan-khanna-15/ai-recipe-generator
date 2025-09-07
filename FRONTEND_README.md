# AI Recipe Generator - Standalone Frontend

This is a standalone React frontend that works directly with Google's Gemini AI API, no backend required!

## 🚀 Quick Start

### Option 1: GitHub Pages (Live Demo)
Visit: https://rohan-khanna-15.github.io/ai-recipe-generator/

### Option 2: Run Locally
1. Clone the repository
2. Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Copy `.env.example` to `.env` and add your API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```
4. Install dependencies and start:
   ```bash
   cd ai-recipe-frontend
   npm install
   npm start
   ```

## 🌟 Features

- **🤖 AI-Powered**: Uses Google Gemini AI for intelligent recipe generation
- **📱 Responsive Design**: Works on desktop and mobile
- **💾 Local Storage**: Saves your recipe history locally (no database needed)
- **🎨 Modern UI**: ChatGPT-style sidebar with clean interface
- **⚡ Fast**: No backend required, direct API calls
- **🔒 Secure**: API key stored in environment variables

## 🛠️ How to Deploy Your Own

### GitHub Pages (Free)
1. Fork this repository
2. Go to Settings > Pages in your GitHub repo
3. Enable GitHub Pages with GitHub Actions
4. Push your changes and it will auto-deploy!

### Vercel (Free)
1. Connect your GitHub repository to Vercel
2. Set root directory to `ai-recipe-frontend`
3. Add environment variable: `REACT_APP_GEMINI_API_KEY`
4. Deploy!

### Netlify (Free)
1. Connect your GitHub repository to Netlify
2. Set build directory to `ai-recipe-frontend/build`
3. Set build command to `cd ai-recipe-frontend && npm run build`
4. Add environment variable: `REACT_APP_GEMINI_API_KEY`
5. Deploy!

## 📋 Example Usage

Enter ingredients like:
- "chicken, rice, onions, garlic, soy sauce"
- "pasta, tomatoes, basil, mozzarella"
- "eggs, flour, milk, sugar, vanilla"

And get detailed recipes with:
- Complete ingredient lists with quantities
- Step-by-step cooking instructions
- Cooking time and difficulty level
- Helpful tips and variations

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API key"
3. Copy the key and add it to your environment variables
4. The key is free with generous rate limits!

## 🎯 Perfect for Interviews

- Demonstrates modern React development
- Shows API integration skills
- Clean, professional UI/UX
- Deployed and accessible online
- Well-documented and maintainable code

---

Built with ❤️ using React and Google Gemini AI
