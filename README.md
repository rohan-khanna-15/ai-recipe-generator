# AI Recipe Generator

A full-stack web application that generates personalized recipes using AI based on user-provided ingredients.

## 🌟 Features

- **AI-Powered Recipe Generation**: Uses Google Gemini 1.5-Flash for intelligent recipe creation
- **User Authentication**: Secure JWT-based login/register system
- **Recipe History**: Persistent storage of generated recipes per user
- **Responsive UI**: Responsive sidebar interface
- **Real-time Generation**: Instant AI responses with loading states

## 🛠️ Tech Stack

### Frontend
- React.js
- CSS3 
- Context API for state management

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- bcrypt password hashing
- Google Gemini AI API

## 🚀 Live Demo

**Website**: [Coming Soon - Deployment in Progress]
**Source Code**: [[GitHub Repository](https://github.com/rohan-khanna-15/ai-recipe-generator)]

## 📱 Screenshots
<img width="1918" height="831" alt="image" src="https://github.com/user-attachments/assets/d8ba2ea0-b486-4ed8-89e7-dd42f71fee0d" />
<img width="1897" height="825" alt="image" src="https://github.com/user-attachments/assets/47266cf8-49a9-4e28-add9-64dfb5d5ea17" />
<img width="1918" height="828" alt="image" src="https://github.com/user-attachments/assets/fd03e411-e618-40d9-a549-2332fe4fd797" />

## 🔧 Local Development

### Prerequisites
- Node.js (v16+)
- MySQL
- Google Gemini API Key

### Setup
1. Clone the repository
```bash
git clone [your-repo-url]
cd ai-recipe-generator
```

2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your environment variables
npm start
```

3. Frontend Setup
```bash
cd ai-recipe-frontend
npm install
npm start
```

## 🌐 Environment Variables

```env
# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recipe_generator
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

## 📝 API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/generate-recipe` - Generate AI recipe
- `GET /api/recipes` - Get user's recipe history
- `DELETE /api/recipes` - Clear recipe history

## 🔒 Security Features

- JWT token-based authentication
- bcrypt password hashing
- CORS protection
- SQL injection prevention
- User data isolation

## 🎯 Future Enhancements

- Recipe sharing functionality
- Ingredient nutrition information
- Recipe rating system
- Export recipes as PDF
- Mobile app version

## 👨‍💻 Author

**Rohan Khanna**
- GitHub: [@rohan-khanna-15]
- LinkedIn: [[Your LinkedIn](https://www.linkedin.com/in/rohan-khanna1512/)]

## 📄 License

This project is licensed under the MIT License.
