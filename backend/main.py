from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from bson import ObjectId
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="QuickPoll API", version="1.0.0")

# CORS middleware - Updated for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://quickpoll-frontend.vercel.app",  # Vercel frontend URL
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise Exception("MONGODB_URL environment variable missing")

print(f"Connecting to MongoDB: {MONGODB_URL[:50]}...")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.quickpoll

# Test MongoDB connection
async def test_mongodb_connection():
    try:
        await client.admin.command('ping')
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, poll_id: str):
        await websocket.accept()
        if poll_id not in self.active_connections:
            self.active_connections[poll_id] = []
        self.active_connections[poll_id].append(websocket)

    def disconnect(self, websocket: WebSocket, poll_id: str):
        if poll_id in self.active_connections:
            self.active_connections[poll_id].remove(websocket)

    async def broadcast_to_poll(self, poll_id: str, message: dict):
        if poll_id in self.active_connections:
            for connection in self.active_connections[poll_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

    async def broadcast_to_all(self, message: dict):
        for poll_connections in self.active_connections.values():
            for connection in poll_connections:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

manager = ConnectionManager()

# Startup event to test MongoDB connection
@app.on_event("startup")
async def startup_event():
    """Test MongoDB connection on startup"""
    try:
        await asyncio.wait_for(client.admin.command('ping'), timeout=10.0)
        print("✅ MongoDB connection successful on startup")
    except asyncio.TimeoutError:
        print("⚠️ MongoDB connection timeout on startup")
    except Exception as e:
        print(f"❌ MongoDB connection failed on startup: {e}")

# Pydantic models
class PollOption(BaseModel):
    id: str
    text: str
    votes: int = 0

class PollCreate(BaseModel):
    question: str
    options: List[str]

class PollResponse(BaseModel):
    id: str
    question: str
    options: List[PollOption]
    likes: int = 0
    created_at: datetime
    total_votes: int = 0

class VoteRequest(BaseModel):
    option_id: str
    user_id: Optional[str] = None

class LikeRequest(BaseModel):
    user_id: Optional[str] = None

# Helper function to convert ObjectId to string
def poll_serializer(poll) -> dict:
    poll["id"] = str(poll["_id"])
    poll["created_at"] = poll["created_at"]
    return poll

# API Routes
@app.get("/")
async def root():
    return {"message": "QuickPoll API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify MongoDB connection"""
    try:
        # Test MongoDB connection with timeout
        await asyncio.wait_for(client.admin.command('ping'), timeout=5.0)
        return {
            "status": "healthy",
            "mongodb": "connected",
            "message": "All systems operational"
        }
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "mongodb": "timeout",
                "error": "MongoDB connection timeout",
                "message": "Database connection timed out"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "mongodb": "disconnected",
                "error": str(e),
                "message": "Database connection failed"
            }
        )

@app.post("/polls", response_model=PollResponse)
async def create_poll(poll_data: PollCreate):
    """Create a new poll"""
    poll_id = str(uuid.uuid4())
    
    # Create options with unique IDs
    options = []
    for i, option_text in enumerate(poll_data.options):
        option_id = chr(65 + i)  # A, B, C, etc.
        options.append({
            "id": option_id,
            "text": option_text,
            "votes": 0
        })
    
    poll = {
        "_id": poll_id,
        "question": poll_data.question,
        "options": options,
        "likes": 0,
        "created_at": datetime.utcnow(),
        "total_votes": 0
    }
    
    result = await db.polls.insert_one(poll)
    if result.inserted_id:
        poll["id"] = str(poll["_id"])
        del poll["_id"]
        
        # Broadcast new poll to all connected clients
        await manager.broadcast_to_poll("general", {
            "type": "new_poll",
            "poll": poll
        })
        
        return PollResponse(**poll)
    else:
        raise HTTPException(status_code=500, detail="Failed to create poll")

@app.get("/polls", response_model=List[PollResponse])
async def get_polls():
    """Get all polls"""
    try:
        polls = []
        async for poll in db.polls.find().sort("created_at", -1):
            poll_dict = poll_serializer(poll)
            poll_dict["total_votes"] = sum(option["votes"] for option in poll_dict["options"])
            polls.append(PollResponse(**poll_dict))
        
        return polls
    except Exception as e:
        print(f"Error fetching polls: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to fetch polls",
                "message": str(e)
            }
        )

@app.get("/polls/{poll_id}", response_model=PollResponse)
async def get_poll(poll_id: str):
    """Get a specific poll"""
    poll = await db.polls.find_one({"_id": poll_id})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    poll_dict = poll_serializer(poll)
    poll_dict["total_votes"] = sum(option["votes"] for option in poll_dict["options"])
    return PollResponse(**poll_dict)

@app.post("/polls/{poll_id}/vote")
async def vote_poll(poll_id: str, vote_data: VoteRequest):
    """Vote on a poll"""
    poll = await db.polls.find_one({"_id": poll_id})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if option exists
    option_found = False
    for option in poll["options"]:
        if option["id"] == vote_data.option_id:
            option_found = True
            option["votes"] += 1
            break
    
    if not option_found:
        raise HTTPException(status_code=400, detail="Invalid option")
    
    # Update poll in database
    await db.polls.update_one(
        {"_id": poll_id},
        {"$set": {"options": poll["options"]}}
    )
    
    # Calculate total votes
    total_votes = sum(option["votes"] for option in poll["options"])
    
    # Broadcast update to all clients watching this poll and general channel
    await manager.broadcast_to_poll(poll_id, {
        "type": "vote_update",
        "poll_id": poll_id,
        "options": poll["options"],
        "total_votes": total_votes
    })
    await manager.broadcast_to_poll("general", {
        "type": "vote_update",
        "poll_id": poll_id,
        "options": poll["options"],
        "total_votes": total_votes
    })
    
    return {"message": "Vote recorded successfully", "total_votes": total_votes}

@app.post("/polls/{poll_id}/like")
async def like_poll(poll_id: str, like_data: LikeRequest):
    """Like/unlike a poll"""
    poll = await db.polls.find_one({"_id": poll_id})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # For simplicity, we'll just increment likes
    # In a real app, you'd track which users liked which polls
    new_likes = poll["likes"] + 1
    
    await db.polls.update_one(
        {"_id": poll_id},
        {"$set": {"likes": new_likes}}
    )
    
    # Broadcast update to all clients watching this poll and general channel
    await manager.broadcast_to_poll(poll_id, {
        "type": "like_update",
        "poll_id": poll_id,
        "likes": new_likes
    })
    await manager.broadcast_to_poll("general", {
        "type": "like_update",
        "poll_id": poll_id,
        "likes": new_likes
    })
    
    return {"message": "Poll liked successfully", "likes": new_likes}

# WebSocket endpoint for general updates
@app.websocket("/ws/general")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket, "general")
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "general")

# WebSocket endpoint for specific poll
@app.websocket("/ws/{poll_id}")
async def websocket_poll_endpoint(websocket: WebSocket, poll_id: str):
    await manager.connect(websocket, poll_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
