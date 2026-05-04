from pinecone import Pinecone, ServerlessSpec
# Updated: OpenAIEmbeddings ki jagah GoogleGenerativeAIEmbeddings import kiya
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from app.core.config import settings
import time
import asyncio

class VectorDBService:
    """
    Manages interactions with Pinecone Vector Database.
    Handles embedding generation, document upserting, and similarity search.
    """

    def __init__(self):
        # Initialize Pinecone Client with API key from settings
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME
        
        # Updated: Initialize Gemini Embedding Model
        # text-embedding-004 Gemini ka latest aur most efficient embedding model hai
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        # Ensure the index exists before performing any operations
        self._ensure_index_exists()

    def _ensure_index_exists(self):
        """
        Checks if the index exists, creates it if not (Serverless Spec).
        """
        existing_indexes = [i.name for i in self.pc.list_indexes()]
        if self.index_name not in existing_indexes:
            print(f"Creating new Pinecone index '{self.index_name}' with dimension 768...")
            self.pc.create_index(
                name=self.index_name,
                dimension=3072, # CRITICAL UPDATE: Gemini text-embedding-004 uses 768 dimensions (OpenAI used 1536)
                metric='cosine',
                spec=ServerlessSpec(cloud='aws', region='us-east-1')
            )
            # Wait for index to initialize to avoid connection errors
            time.sleep(10)

    def get_vector_store_instance(self):
        """
        Returns the LangChain VectorStore object for the retriever tool.
        """
        return PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )

    async def upsert_transcription(self, segments, video_id: str, user_id: str):
        """
        Processes transcription segments, creates embeddings, and stores them in Pinecone.
        Includes metadata for timestamp retrieval and source filename.
        """
        documents = []
        
        for segment in segments:
            # Prepare metadata for RAG retrieval (Time + Source)
            metadata = {
                "video_id": video_id,
                "user_id": user_id,
                "start_time": segment["start"],
                "end_time": segment["end"],
                "text": segment["text"],
                # Capture the filename if it was injected by the ingest service.
                # This key is crucial for the frontend to know which video to switch to.
                "filename": segment.get("filename", "")
            }
            
            # Create a document object (LangChain format)
            doc = Document(
                page_content=segment["text"],
                metadata=metadata
            )
            documents.append(doc)

        # Initialize Vector Store wrapper and upload documents
        vector_store = PineconeVectorStore.from_documents(
            documents=documents,
            embedding=self.embeddings,
            index_name=self.index_name
        )
        
        return len(documents)

    async def search(self, query: str, user_id: str, k: int = 1):
        """
        Performs a similarity search to find the most relevant video segment.
        Used specifically to detect the source video filename for auto-switching.
        """
        vector_store = self.get_vector_store_instance()
        
        # Get current loop to run synchronous code in a thread executor
        # This is safer than asyncio.to_thread for compatibility across Python versions
        loop = asyncio.get_running_loop()
        
        results = await loop.run_in_executor(
            None, 
            lambda: vector_store.similarity_search(
                query,
                k=k,
                filter={"user_id": user_id}
            )
        )
        
        # Return the results as a list of dictionaries for easier parsing in the endpoint.
        return [{"metadata": doc.metadata, "content": doc.page_content} for doc in results]