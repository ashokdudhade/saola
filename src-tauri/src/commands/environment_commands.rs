use crate::errors::AppError;
use crate::models::{EnvVariable, Environment};
use crate::services::{
    load_active_environment_id, load_environments, save_active_environment_id, save_environments,
};
use serde::Deserialize;
use uuid::Uuid;

fn generate_id() -> String {
    format!("env-{}", Uuid::new_v4().simple())
}

#[tauri::command]
pub fn get_environments() -> Result<Vec<Environment>, AppError> {
    load_environments()
}

#[tauri::command]
pub fn get_active_environment() -> Result<Option<Environment>, AppError> {
    let id = load_active_environment_id()?;
    let id = match id {
        Some(id) => id,
        None => return Ok(None),
    };
    let envs = load_environments()?;
    Ok(envs.into_iter().find(|e| e.id == id))
}

#[tauri::command]
pub fn create_environment(name: String) -> Result<Environment, AppError> {
    let mut envs = load_environments()?;
    let env = Environment {
        id: generate_id(),
        name,
        variables: vec![],
    };
    envs.push(env.clone());
    save_environments(&envs)?;
    Ok(env)
}

#[derive(Debug, Deserialize)]
pub struct UpdateEnvironmentPayload {
    pub name: Option<String>,
    pub variables: Option<Vec<EnvVariable>>,
}

#[tauri::command]
pub fn update_environment(
    id: String,
    payload: UpdateEnvironmentPayload,
) -> Result<Environment, AppError> {
    let mut envs = load_environments()?;
    let pos = envs.iter().position(|e| e.id == id).ok_or_else(|| {
        AppError::Collection(format!("Environment not found: {}", id))
    })?;
    let mut env = envs[pos].clone();
    if let Some(name) = payload.name {
        env.name = name;
    }
    if let Some(variables) = payload.variables {
        env.variables = variables;
    }
    envs[pos] = env.clone();
    save_environments(&envs)?;
    Ok(env)
}

#[tauri::command]
pub fn delete_environment(id: String) -> Result<(), AppError> {
    let mut envs = load_environments()?;
    envs.retain(|e| e.id != id);
    save_environments(&envs)?;
    if load_active_environment_id()?.as_deref() == Some(&id) {
        save_active_environment_id(None)?;
    }
    Ok(())
}

#[tauri::command]
pub fn set_active_environment(id: Option<String>) -> Result<(), AppError> {
    save_active_environment_id(id.as_deref())
}
