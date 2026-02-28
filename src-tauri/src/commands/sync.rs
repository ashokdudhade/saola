use crate::errors::AppError;

#[tauri::command]
pub async fn sync_push() -> Result<String, AppError> {
    log::info!("Sync push requested");
    Ok("Sync push placeholder - Phase 2".to_string())
}

#[tauri::command]
pub async fn sync_pull() -> Result<String, AppError> {
    log::info!("Sync pull requested");
    Ok("Sync pull placeholder - Phase 2".to_string())
}
