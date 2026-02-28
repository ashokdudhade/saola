use crate::errors::AppError;
use crate::models::Collection;
use std::fs;
use std::path::PathBuf;

fn collections_path() -> Result<PathBuf, AppError> {
    let dirs = directories::ProjectDirs::from("", "saola", "Saola")
        .ok_or_else(|| AppError::Io("Could not resolve app data directory".into()))?;
    let data_dir = dirs.data_dir();
    fs::create_dir_all(data_dir)?;
    Ok(data_dir.join("collections.json"))
}

pub fn load_collections() -> Result<Vec<Collection>, AppError> {
    let path = collections_path()?;
    if !path.exists() {
        return Ok(vec![]);
    }
    let json = fs::read_to_string(&path)?;
    let collections: Vec<Collection> =
        serde_json::from_str(&json).map_err(|e| AppError::Collection(e.to_string()))?;
    Ok(collections)
}

pub fn save_collections(collections: &[Collection]) -> Result<(), AppError> {
    let path = collections_path()?;
    let json = serde_json::to_string_pretty(collections)?;
    fs::write(path, json)?;
    Ok(())
}
