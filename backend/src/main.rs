mod config;
mod database;
mod errors;
mod handlers;
mod models;
mod routes;
mod utils;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use log::info;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Load environment variables
    dotenv::dotenv().ok();

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    info!("🚀 Starting SoundScape Backend Server at {}:{}", host, port);
    info!("🎵 Backend running in development mode");

    // Initialize database (placeholder for now)
    database::init_db("placeholder")
        .await
        .expect("Failed to initialize database");

    HttpServer::new(move || {
        // Configure CORS
        let cors = Cors::default()
            .allowed_origin_fn(|origin, _req_head| {
                // Allow localhost and netlify domains for development and production
                let origin_str = origin.as_bytes();
                let origin_str = std::str::from_utf8(origin_str).unwrap_or("");

                origin_str.starts_with("http://localhost")
                    || origin_str.starts_with("https://localhost")
                    || origin_str.ends_with(".netlify.app")
                    || origin_str.ends_with(".netlify.com")
                    || origin_str == "https://soundscapelib.netlify.app"
            })
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
            .allowed_headers(vec![
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
            ])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .configure(routes::configure_routes)
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}
