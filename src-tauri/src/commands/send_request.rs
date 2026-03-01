use crate::errors::AppError;
use crate::models::HttpRequest;
use crate::services::{
    interpolate, interpolate_header_pair, load_active_environment_id, load_environments,
};
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn send_request(
    request: HttpRequest,
    state: State<'_, AppState>,
) -> Result<crate::models::HttpResponse, AppError> {
    let mut url = request.url.clone();
    let mut headers = request.headers.clone();
    let mut body = request.body.clone();

    if let Some(active_id) = load_active_environment_id()? {
        if let Ok(envs) = load_environments() {
            if let Some(env) = envs.into_iter().find(|e| e.id == active_id) {
                url = interpolate(&url, &env);
                headers = headers
                    .iter()
                    .map(|h| interpolate_header_pair(h, &env))
                    .collect();
                if let Some(ref b) = body {
                    body = Some(interpolate(b, &env));
                }
            }
        }
    }

    state
        .request_service
        .send(
            &request.method,
            &url,
            &headers,
            body.as_deref(),
        )
        .await
}
