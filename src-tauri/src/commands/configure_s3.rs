use crate::errors::AppError;
use crate::services::{load_storage_provider, save_storage_provider};
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
    let (provider, _) = load_storage_provider()?;
    save_storage_provider(&provider, true)?;
    Ok(())
}

#[tauri::command]
pub fn get_storage_provider() -> Result<StorageProviderStatus, AppError> {
    let (provider, s3_configured) = load_storage_provider()?;
    Ok(StorageProviderStatus {
        provider,
        s3_configured,
    })
}

#[tauri::command]
pub fn set_storage_provider(provider: String) -> Result<(), AppError> {
    let (_, s3_configured) = load_storage_provider()?;
    save_storage_provider(&provider, s3_configured)?;
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageProviderStatus {
    pub provider: String,
    pub s3_configured: bool,
}
