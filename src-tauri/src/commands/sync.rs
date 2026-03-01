use crate::errors::AppError;
use crate::services::load_collections;

#[tauri::command]
pub async fn sync_push() -> Result<String, AppError> {
    let collections = load_collections()?;
    let count = collections.len();
    let req_count: usize = collections
        .iter()
        .map(|c| count_requests(c))
        .sum();
    // Wire to collections JSON: data is already local. For S3/GDrive, upload would go here.
    log::info!("Sync push: {} collections, {} requests", count, req_count);
    Ok(format!("Pushed {} collections ({} requests) to local storage", count, req_count))
}

#[tauri::command]
pub async fn sync_pull() -> Result<String, AppError> {
    // Wire to collections JSON: re-read from disk (for cloud providers, fetch & save would go here)
    let collections = load_collections()?;
    let count = collections.len();
    log::info!("Sync pull: {} collections", count);
    Ok(format!("Refreshed {} collections from storage", count))
}

fn count_requests(col: &crate::models::Collection) -> usize {
    fn walk(items: &[crate::models::CollectionItem]) -> usize {
        items
            .iter()
            .map(|i| match i {
                crate::models::CollectionItem::Folder { children, .. } => walk(children),
                crate::models::CollectionItem::Request { .. } => 1,
            })
            .sum()
    }
    walk(&col.children)
}
