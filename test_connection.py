#!/usr/bin/env python3
"""
Test MongoDB Atlas connection for QuickPoll
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def test_connection():
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    print(f"🔗 Testing connection to: {mongodb_url}")
    
    try:
        client = AsyncIOMotorClient(mongodb_url)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful!")
        
        # Test database access
        db = client.quickpoll
        collections = await db.list_collection_names()
        print(f"📊 Available collections: {collections}")
        
        # Test polls collection
        polls_count = await db.polls.count_documents({})
        print(f"📝 Polls in database: {polls_count}")
        
        await client.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing QuickPoll MongoDB Connection")
    print("=" * 40)
    
    success = asyncio.run(test_connection())
    
    if success:
        print("\n🎉 Connection test passed! Your backend should work now.")
    else:
        print("\n💡 Troubleshooting tips:")
        print("1. Check your MongoDB Atlas connection string")
        print("2. Ensure your IP is whitelisted in Atlas Network Access")
        print("3. Verify your database user credentials")
        print("4. Make sure the database name 'quickpoll' exists")
