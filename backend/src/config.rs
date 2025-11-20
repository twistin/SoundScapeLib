use std::env;

pub struct Config {
    pub database_url: String,
    pub host: String,
    pub port: String,
    pub uploads_dir: String,
    pub frontend_url: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT").unwrap_or_else(|_| "8080".to_string()),
            uploads_dir: env::var("UPLOADS_DIR").unwrap_or_else(|_| "./uploads".to_string()),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
        }
    }
}
