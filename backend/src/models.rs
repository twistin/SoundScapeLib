use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub avatar_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(length(min = 1, max = 100))]
    pub name: String,
    #[validate(email)]
    pub email: String,
    pub avatar_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateProjectRequest {
    #[validate(length(min = 1, max = 200))]
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct SoundscapeSession {
    pub id: Uuid,
    pub title: String,
    pub author: String,
    pub project_id: Uuid,
    pub description: Option<String>,
    pub location_name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub image_url: Option<String>,
    pub audio_url: Option<String>,
    pub equipment: Option<String>,
    pub sound_type: SoundType,
    pub date: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type)]
#[sqlx(type_name = "sound_type", rename_all = "PascalCase")]
pub enum SoundType {
    Forest,
    Urban,
    Marine,
    Desert,
    Industrial,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateSoundscapeSessionRequest {
    #[validate(length(min = 1, max = 200))]
    pub title: String,
    #[validate(length(min = 1, max = 100))]
    pub author: String,
    pub project_id: Uuid,
    pub description: Option<String>,
    #[validate(length(min = 1, max = 200))]
    pub location_name: String,
    #[validate(range(min = -90.0, max = 90.0))]
    pub latitude: f64,
    #[validate(range(min = -180.0, max = 180.0))]
    pub longitude: f64,
    pub equipment: Option<String>,
    pub sound_type: SoundType,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct AttachedFile {
    pub id: Uuid,
    pub name: String,
    pub file_path: String,
    pub file_type: FileType,
    pub file_size: i64,
    pub session_id: Option<Uuid>,
    pub project_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type)]
#[sqlx(type_name = "file_type", rename_all = "lowercase")]
pub enum FileType {
    Audio,
    Image,
    Other,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMember {
    pub project_id: Uuid,
    pub user_id: Uuid,
    pub role: MemberRole,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type)]
#[sqlx(type_name = "member_role", rename_all = "lowercase")]
pub enum MemberRole {
    Owner,
    Member,
    Viewer,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectResponse {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub owner: User,
    pub members: Vec<User>,
    pub attachments: Vec<AttachedFile>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SoundscapeSessionResponse {
    pub id: Uuid,
    pub title: String,
    pub author: String,
    pub project: String,
    pub description: Option<String>,
    pub location: LocationResponse,
    pub image_url: Option<String>,
    pub audio_url: Option<String>,
    pub equipment: Option<String>,
    pub sound_type: SoundType,
    pub date: DateTime<Utc>,
    pub attachments: Vec<AttachedFile>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationResponse {
    pub name: String,
    pub lat: f64,
    pub lng: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
    pub errors: Option<Vec<String>>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
            errors: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
            errors: None,
        }
    }

    pub fn validation_error(errors: Vec<String>) -> Self {
        Self {
            success: false,
            data: None,
            message: Some("Validation failed".to_string()),
            errors: Some(errors),
        }
    }
}
