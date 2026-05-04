import os
import asyncio
import traceback
import pickle  # Standard library for robust object serialization
from typing import Annotated, TypedDict, Any

# --- 1. Database Imports (PostgreSQL & Pooling) ---
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

# --- 2. LangChain & Gemini Imports ---
# Updated: OpenAI se Google GenAI mein change kiya
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool

# --- 3. LangGraph Imports (State Management) ---
from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# --- 4. Advanced Search Imports (Reranking) ---
# NOTE: Reranker disabled for stability on Railway/Local
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_community.document_compressors.flashrank_rerank import FlashrankRerank

# --- 5. Internal Application Imports ---
from app.core.config import settings
from app.services.vector_store import VectorDBService
from dotenv import load_dotenv
# =============================================================================
# GLOBAL CONNECTION POOL MANAGEMENT (Singleton Pattern)
# =============================================================================
_SHARED_POOL = None

async def get_global_pool():
    """
    Creates or returns a singleton connection pool.
    Ensures we don't open multiple pools for the same application.
    """
    global _SHARED_POOL
    
    # Return existing pool if available
    if _SHARED_POOL is not None:
        return _SHARED_POOL

    # Load DB URL from environment
    db_url = os.getenv("NEON_DB_URL")
    if not db_url:
        raise ValueError("NEON_DB_URL is not set in environment variables.")

    # Connection Health Check Function
    # CRITICAL FIX: This function is called by the pool to verify the connection is alive.
    async def check_connection(conn):
        await conn.execute("SELECT 1")

    # Connection Arguments (Neon DB Stability Settings)
    connection_kwargs = {
        "autocommit": True, 
        "prepare_threshold": None, # Critical: Disable prepared statements for Neon to prevent SSL errors
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5
    }

    print("🔌 Creating NEW Global Connection Pool for Neon DB...")
    
    _SHARED_POOL = AsyncConnectionPool(
        conninfo=db_url, 
        max_size=20, 
        kwargs=connection_kwargs, 
        min_size=0,           
        max_lifetime=300,  # 5 Minutes
        timeout=30.0,
        open=False,
        check=check_connection # Ensures connection is alive, fixes "SSL bad length" error
    )
    
    # Open the pool explicitly
    await _SHARED_POOL.open()
    return _SHARED_POOL

# =============================================================================
# CUSTOM SERIALIZER: Robust Object Handling
# =============================================================================
class PickleSerializer:
    """
    Custom serializer using Python's built-in 'pickle'.
    Includes Fallback logic to prevent crashing on old database data.
    """
    def dumps(self, obj: Any) -> bytes:
        return pickle.dumps(obj)

    def loads(self, data: bytes) -> Any:
        try:
            return pickle.loads(data)
        except Exception:
            # SAFETY NET: If old data fails to load, return None to prevent crash
            print("⚠️ Warning: Failed to load old checkpoint data. Starting fresh.")
            return None

    def dumps_typed(self, obj: Any) -> tuple[str, bytes]:
        return "pickle", self.dumps(obj)

    def loads_typed(self, data: tuple[str, bytes]) -> Any:
        type_, content = data
        if type_ == "pickle":
            return self.loads(content)
        # Fallback for legacy data types
        print(f"⚠️ Warning: Ignoring legacy data type '{type_}'. Resetting state.")
        return {"messages": []}

# =============================================================================
# AGENT STATE DEFINITION
# =============================================================================
class AgentState(TypedDict):
    """
    Defines the structure of our conversation state.
    """
    messages: Annotated[list[BaseMessage], add_messages]

# =============================================================================
# MAIN SERVICE CLASS: RAG Agent
# =============================================================================
class RAGAgentService:
    def __init__(self):
        """
        Initializes the core services.
        """
        # 1. Initialize Vector Database connection
        self.vector_db = VectorDBService()
        
        # 2. Initialize LLM (Gemini) with Streaming enabled
        # Updated: Using Gemini 1.5 Pro (Aap gemini-1.5-flash bhi use kar saktay hain)
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0,  # Zero temperature for factual consistency
            google_api_key=settings.GOOGLE_API_KEY, # Updated to use Google API Key
            streaming=True
        )
        
        # 3. Initialize Advanced Reranker Model (FlashRank)
        # Disabled for stability based on previous issues
        self.reranker = None
        self.reranker_available = False
        # try:
        #     print("Initializing Advanced Reranker (FlashRank)...")
        #     self.reranker = FlashrankRerank(model="ms-marco-MiniLM-L-12-v2", top_n=50)
        #     self.reranker_available = True
        # except Exception as e:
        #     print(f"⚠️ Warning: Reranker failed to initialize: {e}")
        #     self.reranker_available = False

    def _create_graph_for_user(self, user_id: str, checkpointer, video_id: str = None):
        """
        Dynamically builds a unique LangGraph workflow for a specific user.
        Accepts optional 'video_id' (filename) to filter search results.
        """
        
        # --- A. Define the Retrieval Tool ---
        vector_store_instance = self.vector_db.get_vector_store_instance()
        
        # --- DYNAMIC FILTERING LOGIC ---
        # Base filter: User ID (Always required)
        search_filters = {"user_id": user_id}
        
        # Additional filter: Video ID (If provided)
        # This forces the AI to search ONLY within the specific video file.
        # This fixes the "Context Leakage" issue.
        if video_id:
            search_filters["filename"] = video_id

        # Strategy 1: Broad Search (The Net)
        base_retriever = vector_store_instance.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 50, 
                "filter": search_filters # <--- USE THE FILTER HERE
            }
        )
        
        # Strategy 2: Reranking Logic (The Filter)
        final_retriever = base_retriever
        if self.reranker_available and self.reranker:
            try:
                final_retriever = ContextualCompressionRetriever(
                    base_compressor=self.reranker, 
                    base_retriever=base_retriever
                )
            except Exception:
                final_retriever = base_retriever

        # --- HELPER FUNCTION: Convert Seconds to MM:SS ---
        def format_time(seconds):
            try:
                if seconds is None: return "00:00"
                val = float(seconds)
                m = int(val // 60)
                s = int(val % 60)
                return f"{m:02d}:{s:02d}"
            except:
                return "00:00"
        
        # --- ASYNC TOOL DEFINITION ---
        @tool(response_format="content_and_artifact")
        async def retrieve_video_context(query: str):
            """
            Search for detailed information within the video content.
            Returns transcript segments with precise, pre-formatted timestamps and Speaker Info.
            """
            try:
                # Invoke the retriever ASYNCHRONOUSLY
                docs = await final_retriever.ainvoke(query)
                
            except Exception as e:
                # Fallback if DB fails
                docs = await base_retriever.ainvoke(query)
            
            # --- CLEAN FORMATTING LOGIC (No metadata clutter) ---
            serialized_parts = []
            for doc in docs:
                raw_start = doc.metadata.get('start_time', 0)
                formatted_ts = format_time(raw_start)
                
                # Simplified format: just timestamp and content
                # This keeps the tool output clean for the LLM to process
                text_chunk = f"**[{formatted_ts}]**: {doc.page_content}"
                serialized_parts.append(text_chunk)
            
            serialized = "\n\n".join(serialized_parts)
            return serialized, docs

        # --- B. Define Graph Nodes ---
        tools = [retrieve_video_context]
        llm_with_tools = self.llm.bind_tools(tools)

        # --- C. SYSTEM PROMPT (ULTIMATE RESEARCHER MODE) ---
        # This prompt forces the agent to search first and prevents lazy answering.
        system_prompt = """### 🛡️ ROLE & PRIME DIRECTIVE
        You are the **Video RAG Intelligence Engine**, an advanced AI designed for forensic-level video analysis. 
        Your mission is to extract precise, evidence-based answers from video transcripts with absolute accuracy.

        ### 🚨 OPERATIONAL RULES (MUST FOLLOW) 🚨
        1. **TABULA RASA (BLANK SLATE):** You possess **NO** prior knowledge of the video. You **CANNOT** answer any question without data.
        2. **MANDATORY SEARCH:** For every single user interaction, you **MUST** trigger the `retrieve_video_context` tool first.
        3. **STRICT GROUNDING:** Your answer must be derived *exclusively* from the search results provided by the tool. Do not use outside knowledge.

        ### 🕰️ TIMESTAMP & CITATION PROTOCOL (NON-NEGOTIABLE)
        The context you receive will contain pre-calculated timestamps like **[mm:ss]**.
        * **RULE A:** You must cite a timestamp for **EVERY** key claim you make.
        * **RULE B:** Use the exact format **[mm:ss]**. Do NOT attempt to calculate, add, or subtract time.
        * **RULE C:** Place the timestamp *immediately* after the sentence it supports.
            * *Correct:* "The engine fails at high speeds **[12:45]**."
            * *Incorrect:* "The engine fails. **[12:45]**"

        ### 👤 SPEAKER IDENTIFICATION
        * The context provides metadata: `Speaker: [Name]`.
        * Always attribute quotes to the correct speaker.
        * If the speaker is "Unknown" or generic, refer to them as "The speaker" or "The narrator."

        ### 🧠 SYNTHESIS & REASONING (ADVANCED MODE)
        Do not just summarize; perform **Deep Synthesis**:
        * **Connect the Dots:** If Segment A mentions a problem **[02:00]** and Segment B mentions the solution **[05:30]**, combine them into one coherent insight.
        * **Direct Answers:** Start with the direct answer to the user's question. Don't fluff.
        * **Evidence-Based Tone:** Write like a professional researcher. Be objective, concise, and factual.

        ### 🚫 ERROR HANDLING
        * **Empty Context:** If the search returns no results or irrelevant text, you MUST state: 
            *"I analyzed the video transcript, but I could not find specific information regarding [Topic]. The video focuses on [Brief Summary of what IS there]."*
        * **No Hallucinations:** Never invent details to fill gaps.

        ### INPUT CONTEXT EXAMPLE
        *Input:* `Video: 'AI Future' | Speaker: Sam Altman | Timestamp **[04:20]**: We believe AGI will change the workforce.`
        
        *Your Output:* "Sam Altman predicts that Artificial General Intelligence (AGI) is poised to fundamentally transform the workforce structure **[04:20]**."
        """

        def reasoner(state: AgentState):
            return {"messages": [llm_with_tools.invoke([SystemMessage(content=system_prompt)] + state["messages"])]}

        # --- D. Construct the Graph ---
        workflow = StateGraph(AgentState)
        workflow.add_node("agent", reasoner)
        workflow.add_node("tools", ToolNode(tools))

        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges("agent", tools_condition)
        workflow.add_edge("tools", "agent")
        
        return workflow.compile(checkpointer=checkpointer)

    async def stream_answer(self, user_input: str, thread_id: str, video_id: str = None):
        """
        Public method to stream the answer using Postgres (Neon DB) for persistence.
        Accepts optional 'video_id' to filter search results.
        """
        user_id = thread_id 
        config = {"configurable": {"thread_id": thread_id}}
        inputs = {"messages": [HumanMessage(content=user_input)]}
        
        try:
            # 1. Retrieve the Global Singleton Pool
            async_pool = await get_global_pool()

            print(f"✅ Using Global Postgres Pool for Thread: {thread_id}")

            # 2. Initialize Postgres Checkpointer
            checkpointer = AsyncPostgresSaver(async_pool, serde=PickleSerializer())
            
            # 3. Setup the Checkpointer
            await checkpointer.setup()
            
            # 4. Build the graph for this specific request
            # Pass the video_id to enforce filtering
            app = self._create_graph_for_user(user_id, checkpointer, video_id)
            
            print(f"🚀 Starting Stream for Thread: {thread_id}")
            
            # 5. Stream events using V2
            async for event in app.astream_events(inputs, config=config, version="v2"):
                
                kind = event["event"]
                
                # --- Show Searching Status ---
                if kind == "on_tool_start":
                    yield "\n\n> *🔍 Searching video transcripts...*\n\n"
                
                elif kind == "on_tool_end":
                    yield "> *✅ Search complete. Analyzing...*\n\n"

                # Filter for LLM Token Generation events (only stream actual model output)
                elif kind == "on_chat_model_stream":
                    data = event["data"]
                    if "chunk" in data:
                        content = data["chunk"].content
                        # Only yield text content; skip tool calls, metadata, or other artifacts
                        if content and isinstance(content, str) and content.strip():
                            # Filter out any JSON or malformed data
                            if not content.strip().startswith('{') and not content.strip().startswith('['):
                                yield content
                            
        except Exception as e:
            # Graceful error handling
            print("--- STREAMING ERROR TRACEBACK ---")
            traceback.print_exc()
            yield f"Error processing request: {str(e)}"
        
        # NOTE: We do NOT close the pool here.