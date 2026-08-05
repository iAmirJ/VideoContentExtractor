from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logger import logger

class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class AuthenticationError(AppError):
    """Exception for authentication failures."""
    def __init__(self, message: str = "Authentication failed", status_code: int = status.HTTP_401_UNAUTHORIZED):
        super().__init__(message, status_code)

class NotFoundError(AppError):
    """Exception for missing resources."""
    def __init__(self, message: str = "Resource not found", status_code: int = status.HTTP_404_NOT_FOUND):
        super().__init__(message, status_code)

class VideoProcessingError(AppError):
    """Exception for video processing failures."""
    def __init__(self, message: str = "Video processing failed", status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(message, status_code)

async def app_error_handler(request: Request, exc: AppError):
    """Global handler for custom AppError exceptions."""
    logger.error(f"AppError: {exc.message} on {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "path": str(request.url)}
    )

async def global_exception_handler(request: Request, exc: Exception):
    """Global fallback handler for unexpected exceptions."""
    logger.error(f"Unexpected Error on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later.", "path": str(request.url)}
    )
