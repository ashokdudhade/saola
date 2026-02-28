use crate::errors::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PostmanImportResult {
    pub collections: usize,
    pub requests: usize,
}

#[tauri::command]
pub fn import_postman(json: String) -> Result<PostmanImportResult, AppError> {
    let v: serde_json::Value = serde_json::from_str(&json).map_err(|e| AppError::Collection(e.to_string()))?;
    let info = v.get("info").and_then(|i| i.get("name"));
    let empty: Vec<serde_json::Value> = vec![];
    let items = v.get("item").and_then(|i| i.as_array()).unwrap_or(&empty);
    let request_count = count_requests(items);
    Ok(PostmanImportResult {
        collections: if info.is_some() { 1 } else { 0 },
        requests: request_count,
    })
}

fn count_requests(items: &[serde_json::Value]) -> usize {
    let mut n = 0;
    for item in items {
        if item.get("request").is_some() {
            n += 1;
        }
        if let Some(children) = item.get("item").and_then(|i| i.as_array()) {
            n += count_requests(children);
        }
    }
    n
}
