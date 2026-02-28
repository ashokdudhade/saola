use crate::errors::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S3Config {
    pub bucket: String,
    pub region: String,
    pub access_key_id: String,
    pub secret_access_key: String,
}

#[tauri::command]
pub async fn configure_s3(config: S3Config) -> Result<(), AppError> {
    // Store config in app state (Phase 3: use keyring for secret)
    log::info!("S3 configured: bucket={}, region={}", config.bucket, config.region);
    Ok(())
}
