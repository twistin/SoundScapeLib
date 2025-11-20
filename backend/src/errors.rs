use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal server error: {0}")]
    InternalError(#[from] anyhow::Error),

    #[error("File upload error: {0}")]
    FileUploadError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::ValidationError(msg) => HttpResponse::BadRequest()
                .json(crate::models::ApiResponse::<()>::error(msg.clone())),
            AppError::NotFound(msg) => {
                HttpResponse::NotFound().json(crate::models::ApiResponse::<()>::error(msg.clone()))
            }
            AppError::BadRequest(msg) => HttpResponse::BadRequest()
                .json(crate::models::ApiResponse::<()>::error(msg.clone())),
            AppError::FileUploadError(msg) => HttpResponse::BadRequest()
                .json(crate::models::ApiResponse::<()>::error(msg.clone())),
            AppError::DatabaseError(err) => {
                log::error!("Database error: {}", err);
                HttpResponse::InternalServerError().json(crate::models::ApiResponse::<()>::error(
                    "Internal server error".to_string(),
                ))
            }
            AppError::InternalError(err) => {
                log::error!("Internal error: {}", err);
                HttpResponse::InternalServerError().json(crate::models::ApiResponse::<()>::error(
                    "Internal server error".to_string(),
                ))
            }
            AppError::IoError(err) => {
                log::error!("IO error: {}", err);
                HttpResponse::InternalServerError().json(crate::models::ApiResponse::<()>::error(
                    "File system error".to_string(),
                ))
            }
        }
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
