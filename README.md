# QuickPoll - Real-Time Opinion Polling Platform

A modern, real-time polling platform built with FastAPI and Next.js that allows users to create polls, vote, and see live updates as they happen.

## 🚀 Features

- **Real-time Updates**: Live vote counts and poll updates using WebSockets
- **Interactive Polling**: Create polls with multiple options and vote instantly
- **Like System**: Users can like/unlike polls with real-time like counts
- **Responsive Design**: Mobile and desktop optimized UI
- **Live Charts**: Beautiful charts showing vote distribution and results
- **Modern Stack**: Built with FastAPI, Next.js, MongoDB, and Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **WebSockets** - Real-time communication
- **Motor** - Async MongoDB driver

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Recharts** - Beautiful charts and visualizations
- **Lucide React** - Modern icon library

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your MongoDB URL
```

5. Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
MONGODB_URL=mongodb://localhost:27017
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/polls` | Get all polls |
| POST | `/polls` | Create a new poll |
| GET | `/polls/{id}` | Get specific poll |
| POST | `/polls/{id}/vote` | Vote on a poll |
| POST | `/polls/{id}/like` | Like/unlike a poll |
| WebSocket | `/ws/{poll_id}` | Real-time updates |

## 🎯 Usage

1. **Create a Poll**: Click "Create Poll" and enter your question with 2-6 answer options
2. **Vote**: Click on any option to cast your vote (one vote per poll)
3. **Like Polls**: Use the heart button to like/unlike polls
4. **View Details**: Click "View Details" to see charts and detailed results
5. **Real-time Updates**: All interactions update instantly across all connected users

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables in your deployment platform
2. Deploy with the provided `requirements.txt`

### Frontend (Vercel/Netlify)
1. Set environment variables for API URLs
2. Deploy with `npm run build`

## 📊 Real-time Architecture

```
Browser → Vote/Like → FastAPI → MongoDB → WebSocket Broadcast → All Browsers
```

The platform uses WebSockets to broadcast updates to all connected clients, ensuring real-time synchronization of votes, likes, and new polls.

## 🎨 UI Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Live Charts**: Pie charts and bar charts for vote visualization
- **Smooth Animations**: CSS transitions for better UX
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Real-time Indicators**: Live vote counts and like counts

## 🔒 Security Features

- CORS protection
- Input validation with Pydantic
- WebSocket connection management
- Rate limiting (can be added)

## 🧪 Testing

Run the backend tests:
```bash
cd backend
pytest
```

Run the frontend tests:
```bash
cd frontend
npm test
```

## 📈 Performance

- **Real-time Updates**: < 500ms latency
- **Scalable**: WebSocket connection pooling
- **Efficient**: React Query caching
- **Fast**: Optimized MongoDB queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Demo

Visit the live demo at [your-deployment-url] to see QuickPoll in action!

---

Built with ❤️ using FastAPI, Next.js, and modern web technologies.
