use crate::errors::AppError;
use base64::Engine;

#[tauri::command]
pub fn decrypt_collections(encrypted_base64: String, master_password: String) -> Result<String, AppError> {
    let ciphertext = base64::engine::general_purpose::STANDARD
        .decode(encrypted_base64)
        .map_err(|e| AppError::Collection(e.to_string()))?;
    let plaintext = crate::services::CryptoService::decrypt(&ciphertext, &master_password)
        .map_err(AppError::Collection)?;
    String::from_utf8(plaintext).map_err(|e| AppError::Collection(e.to_string()))
}
