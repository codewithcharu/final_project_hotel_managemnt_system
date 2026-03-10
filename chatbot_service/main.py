from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import chatbot_logic

app = FastAPI(title="Hotel Chatbot Service")

# CORS middleware to allow requests from the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # React app and Java backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    response: str
    context: Dict[str, Any]
    action: Optional[str] = None
    data: Optional[Any] = None

@app.get("/")
def read_root():
    return {"status": "online", "service": "Hotel Chatbot"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response_text, new_context, action, data = chatbot_logic.process_message(request.message, request.context)
        return ChatResponse(
            response=response_text,
            context=new_context,
            action=action,
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
