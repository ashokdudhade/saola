use crate::errors::AppError;
use base64::Engine;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptResult {
    pub encrypted: String, // base64
}

#[tauri::command]
pub fn encrypt_collections(json: String, master_password: String) -> Result<EncryptResult, AppError> {
    let ciphertext = crate::services::CryptoService::encrypt(json.as_bytes(), &master_password)
        .map_err(AppError::Collection)?;
    Ok(EncryptResult {
        encrypted: base64::engine::general_purpose::STANDARD.encode(ciphertext),
    })
}
