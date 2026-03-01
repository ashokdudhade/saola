use crate::errors::AppError;
use crate::models::Environment;
use std::fs;
use std::path::PathBuf;

fn data_dir() -> Result<PathBuf, AppError> {
    let dirs = directories::ProjectDirs::from("", "saola", "Saola")
        .ok_or_else(|| AppError::Io("Could not resolve app data directory".into()))?;
    fs::create_dir_all(dirs.data_dir())?;
    Ok(dirs.data_dir().to_path_buf())
}

fn environments_path() -> Result<PathBuf, AppError> {
    Ok(data_dir()?.join("environments.json"))
}

fn active_env_path() -> Result<PathBuf, AppError> {
    Ok(data_dir()?.join("active_environment.txt"))
}

pub fn load_environments() -> Result<Vec<Environment>, AppError> {
    let path = environments_path()?;
    if !path.exists() {
        return Ok(vec![]);
    }
    let json = fs::read_to_string(&path)?;
    let envs: Vec<Environment> =
        serde_json::from_str(&json).map_err(|e| AppError::Collection(e.to_string()))?;
    Ok(envs)
}

pub fn save_environments(environments: &[Environment]) -> Result<(), AppError> {
    let path = environments_path()?;
    let json = serde_json::to_string_pretty(environments)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn load_active_environment_id() -> Result<Option<String>, AppError> {
    let path = active_env_path()?;
    if !path.exists() {
        return Ok(None);
    }
    let id = fs::read_to_string(&path)?;
    let id = id.trim();
    if id.is_empty() {
        Ok(None)
    } else {
        Ok(Some(id.to_string()))
    }
}

pub fn save_active_environment_id(id: Option<&str>) -> Result<(), AppError> {
    let path = active_env_path()?;
    match id {
        Some(id) => fs::write(path, id)?,
        None => {
            if path.exists() {
                fs::remove_file(path)?;
            }
        }
    }
    Ok(())
}
