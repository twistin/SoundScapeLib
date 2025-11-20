use crate::models::ApiResponse;
use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct GenerateMetadataRequest {
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct GeneratedMetadata {
    pub title: String,
    pub description: String,
    pub tags: Vec<String>,
    pub atmosphere_keywords: Vec<String>,
}

// Health check endpoint
pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("SoundScape Backend is running! 🎵"))
}

// Placeholder handlers for now (we'll implement database ones later)
pub async fn create_user(request: web::Json<serde_json::Value>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("User creation endpoint - coming soon"))
}

pub async fn get_user(path: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("User get endpoint - coming soon"))
}

pub async fn list_users(query: web::Query<PaginationQuery>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Users list endpoint - coming soon"))
}

pub async fn create_project(request: web::Json<serde_json::Value>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(
        "Project creation endpoint - coming soon",
    ))
}

pub async fn get_project(path: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Project get endpoint - coming soon"))
}

pub async fn list_projects(query: web::Query<PaginationQuery>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Projects list endpoint - coming soon"))
}

pub async fn get_project_sessions(path: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(
        "Project sessions endpoint - coming soon",
    ))
}

pub async fn create_soundscape_session(request: web::Json<serde_json::Value>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(
        "Session creation endpoint - coming soon",
    ))
}

pub async fn get_soundscape_session(path: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Session get endpoint - coming soon"))
}

pub async fn list_soundscape_sessions(query: web::Query<PaginationQuery>) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Sessions list endpoint - coming soon"))
}

pub async fn upload_file() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("File upload endpoint - coming soon"))
}

/// AI metadata generation placeholder.
/// In production you would call your ML model here. For now we craft deterministic metadata
/// so the frontend always receives a valid response.
pub async fn generate_metadata(payload: web::Json<GenerateMetadataRequest>) -> HttpResponse {
    let description = payload.description.trim();
    if description.is_empty() {
        return HttpResponse::BadRequest().json(ApiResponse::<GeneratedMetadata>::error(
            "Description is required".to_string(),
        ));
    }

    let title = format!(
        "AI Generated: {}",
        description
            .split_whitespace()
            .take(6)
            .collect::<Vec<_>>()
            .join(" ")
    );

    let mut tags = vec!["soundscape".to_string(), "field recording".to_string()];
    let lower = description.to_lowercase();
    if lower.contains("forest") || lower.contains("bird") {
        tags.push("forest".into());
        tags.push("biotic".into());
    } else if lower.contains("city") || lower.contains("traffic") {
        tags.push("urban".into());
        tags.push("anthropophonic".into());
    } else if lower.contains("sea") || lower.contains("ocean") || lower.contains("waves") {
        tags.push("marine".into());
        tags.push("geophonic".into());
    }

    let atmosphere_keywords = vec!["immersive".into(), "natural".into(), "detailed".into()];

    let response = GeneratedMetadata {
        title,
        description: description.to_string(),
        tags,
        atmosphere_keywords,
    };

    HttpResponse::Ok().json(ApiResponse::success(response))
}
