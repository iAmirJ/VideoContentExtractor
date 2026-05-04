import traceback
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.services.rag_agent import RAGAgentService
from app.services.vector_store import VectorDBService
import asyncio

router = APIRouter()

# Initialize core services
agent_service = RAGAgentService()
vector_db = VectorDBService()

class ChatRequest(BaseModel):
    query: str
    thread_id: str
    video_id: Optional[str] = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Smart Chat Endpoint.
    Automatically decides whether to stay on the current video 
    or switch to a new one based on the user's question.
    """
    
    if not request.thread_id:
        raise HTTPException(status_code=400, detail="Thread ID is required.")

    async def generate():
        try:
            yield " " # Keep-Alive

            # --- SMART LOGIC START ---
            
            
            search_results = await vector_db.search(request.query, request.thread_id)
            
            best_match_video = None
            if search_results and len(search_results) > 0:
                best_match_video = search_results[0]['metadata'].get('filename')

            # 2. Decision Logic (Context Switching)
            final_target_video = request.video_id # Default to current video

            if request.video_id:
               
                
                is_relevant_locally = False
                if search_results:
                    # Check top 3 results to be safe
                    for i, res in enumerate(search_results[:3]):
                        if res['metadata'].get('filename') == request.video_id:
                            is_relevant_locally = True
                            break
                
                if is_relevant_locally:
                    
                    final_target_video = request.video_id
                elif best_match_video:
                    
                    final_target_video = best_match_video
                    print(f"🔀 Switching Context: {request.video_id} -> {final_target_video}")
            else:
               
                final_target_video = best_match_video

           
            async for token in agent_service.stream_answer(request.query, request.thread_id, final_target_video):
                yield f"{token}"
            
            
            if final_target_video and final_target_video != request.video_id:
                yield f"<<SOURCE:{final_target_video}>>"
            elif final_target_video:
                 
                 yield f"<<SOURCE:{final_target_video}>>"

        except Exception as e:
            print("❌ Backend Error:")
            traceback.print_exc()
            yield f"Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")