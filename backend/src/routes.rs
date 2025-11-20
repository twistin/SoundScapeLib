use crate::handlers;
use actix_web::web;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/health", web::get().to(handlers::health_check))
        .service(
            web::scope("/api/v1")
                .service(
                    web::scope("/users")
                        .route("", web::post().to(handlers::create_user))
                        .route("", web::get().to(handlers::list_users))
                        .route("/{id}", web::get().to(handlers::get_user)),
                )
                .service(
                    web::scope("/projects")
                        .route("", web::post().to(handlers::create_project))
                        .route("", web::get().to(handlers::list_projects))
                        .route("/{id}", web::get().to(handlers::get_project))
                        .route(
                            "/{id}/sessions",
                            web::get().to(handlers::get_project_sessions),
                        ),
                )
                .service(
                    web::scope("/sessions")
                        .route("", web::post().to(handlers::create_soundscape_session))
                        .route("", web::get().to(handlers::list_soundscape_sessions))
                        .route("/{id}", web::get().to(handlers::get_soundscape_session)),
                )
                .route("/upload", web::post().to(handlers::upload_file))
                .service(web::scope("/ai").route(
                    "/generate-metadata",
                    web::post().to(handlers::generate_metadata),
                )),
        );
}
