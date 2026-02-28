use crate::errors::AppError;
use crate::services::load_collections;

#[tauri::command]
pub fn get_collections() -> Result<Vec<crate::models::Collection>, AppError> {
    load_collections()
}
