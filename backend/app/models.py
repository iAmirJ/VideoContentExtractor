from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# 1. Users Table
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50))
    full_name = Column(String(100), nullable=True) 
    role = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    plan_id = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    projects = relationship("VideoProject", back_populates="owner")

# 2. Video Projects
class VideoProject(Base):
    __tablename__ = "video_projects"
    project_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    source_url = Column(String(255))
    title = Column(String(255))
    thumbnail_url = Column(String(255))
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="projects")
    
    # Relationships fixed here
    summary = relationship("Summary", back_populates="project", uselist=False)
    processing_request = relationship("ProcessingRequest", back_populates="project", uselist=False)

# 3. Processing Request (FIXED HERE)
class ProcessingRequest(Base):
    __tablename__ = "processing_requests"
    request_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("video_projects.project_id"))
    job_status = Column(String(50))
    progress_percent = Column(Integer)
    
    # Pehle yahan "project" likha tha, ab sahi kar ke "processing_request" likha hai
    project = relationship("VideoProject", back_populates="processing_request")

# 4. Summaries
class Summary(Base):
    __tablename__ = "summaries"
    summary_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("video_projects.project_id"))
    concise_summary = Column(Text)
    blog_post_content = Column(Text)
    
    project = relationship("VideoProject", back_populates="summary")