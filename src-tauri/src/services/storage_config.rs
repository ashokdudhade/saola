use crate::errors::AppError;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StorageConfig {
    #[serde(default = "default_provider")]
    provider: String,
    #[serde(default)]
    s3_configured: bool,
}

fn default_provider() -> String {
    "local".to_string()
}

fn config_path() -> Result<PathBuf, AppError> {
    let dirs = directories::ProjectDirs::from("", "saola", "Saola")
        .ok_or_else(|| AppError::Io("Could not resolve app data directory".into()))?;
    let data_dir = dirs.data_dir();
    fs::create_dir_all(data_dir)?;
    Ok(data_dir.join("storage_config.json"))
}

pub fn load_storage_provider() -> Result<(String, bool), AppError> {
    let path = config_path()?;
    if !path.exists() {
        return Ok(("local".to_string(), false));
    }
    let json = fs::read_to_string(&path)?;
    let cfg: StorageConfig = serde_json::from_str(&json)
        .unwrap_or_else(|_| StorageConfig {
            provider: "local".to_string(),
            s3_configured: false,
        });
    Ok((cfg.provider, cfg.s3_configured))
}

pub fn save_storage_provider(provider: &str, s3_configured: bool) -> Result<(), AppError> {
    let path = config_path()?;
    let cfg = StorageConfig {
        provider: provider.to_string(),
        s3_configured,
    };
    let json = serde_json::to_string_pretty(&cfg)?;
    fs::write(path, json)?;
    Ok(())
}
