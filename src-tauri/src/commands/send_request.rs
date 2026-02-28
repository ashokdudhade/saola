use crate::errors::AppError;
use crate::models::HttpRequest;
use crate::state::AppState;
use tauri::State;

#[tauri::command]
pub async fn send_request(
    request: HttpRequest,
    state: State<'_, AppState>,
) -> Result<crate::models::HttpResponse, AppError> {
    state
        .request_service
        .send(
            &request.method,
            &request.url,
            &request.headers,
            request.body.as_deref(),
        )
        .await
}
