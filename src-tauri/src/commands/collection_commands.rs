use crate::errors::AppError;
use crate::models::{Collection, CollectionItem};
use crate::services::{load_collections, save_collections};
use serde::Deserialize;
use uuid::Uuid;

fn generate_id(prefix: &str) -> String {
    format!("{}-{}", prefix, Uuid::new_v4().simple())
}

#[derive(Debug, Deserialize)]
pub struct SaveRequestPayload {
    pub id: Option<String>,
    pub name: String,
    pub method: String,
    pub url: String,
    pub params: Vec<crate::models::ParamPair>,
    pub headers: Vec<crate::models::HeaderPair>,
    pub body: Option<String>,
}

fn find_collection_mut<'a>(collections: &'a mut [Collection], id: &str) -> Option<&'a mut Collection> {
    collections.iter_mut().find(|c| c.id == id)
}

fn find_folder_mut<'a>(
    items: &'a mut [CollectionItem],
    parent_id: &str,
) -> Option<&'a mut Vec<CollectionItem>> {
    for item in items {
        match item {
            CollectionItem::Folder { id, children, .. } => {
                if id == parent_id {
                    return Some(children);
                }
                if let Some(c) = find_folder_mut(children, parent_id) {
                    return Some(c);
                }
            }
            _ => {}
        }
    }
    None
}

fn find_and_rename(collections: &mut [Collection], id: &str, new_name: &str) -> bool {
    for c in collections.iter_mut() {
        if c.id == id {
            c.name = new_name.to_string();
            return true;
        }
        if rename_in_items(&mut c.children, id, new_name) {
            return true;
        }
    }
    false
}

fn rename_in_items(items: &mut [CollectionItem], id: &str, new_name: &str) -> bool {
    for item in items {
        match item {
            CollectionItem::Folder { id: fid, name, .. } => {
                if fid == id {
                    *name = new_name.to_string();
                    return true;
                }
                if rename_in_items(
                    match item {
                        CollectionItem::Folder { children, .. } => children,
                        _ => continue,
                    },
                    id,
                    new_name,
                ) {
                    return true;
                }
            }
            CollectionItem::Request { id: rid, name, .. } => {
                if rid == id {
                    *name = new_name.to_string();
                    return true;
                }
            }
        }
    }
    false
}

fn find_and_delete(collections: &mut Vec<Collection>, id: &str) -> bool {
    if let Some(pos) = collections.iter().position(|c| c.id == id) {
        collections.remove(pos);
        return true;
    }
    for c in collections.iter_mut() {
        if delete_from_items(&mut c.children, id) {
            return true;
        }
    }
    false
}

fn delete_from_items(items: &mut Vec<CollectionItem>, id: &str) -> bool {
    if let Some(pos) = items.iter().position(|i| match i {
        CollectionItem::Folder { id: fid, .. } | CollectionItem::Request { id: fid, .. } => fid == id,
    }) {
        items.remove(pos);
        return true;
    }
    for item in items.iter_mut() {
        if let CollectionItem::Folder { children, .. } = item {
            if delete_from_items(children, id) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
pub fn create_collection(name: String) -> Result<Collection, AppError> {
    let mut collections = load_collections()?;
    let id = generate_id("col");
    let collection = Collection {
        id: id.clone(),
        name,
        children: vec![],
    };
    collections.push(collection.clone());
    save_collections(&collections)?;
    Ok(collection)
}

#[tauri::command]
pub fn create_folder(parent_id: String, name: String) -> Result<CollectionItem, AppError> {
    let mut collections = load_collections()?;
    let id = generate_id("fld");

    let folder = CollectionItem::Folder {
        id: id.clone(),
        name,
        children: vec![],
    };

    let mut inserted = false;
    if let Some(col) = find_collection_mut(&mut collections, &parent_id) {
        col.children.push(folder.clone());
        inserted = true;
    }
    if !inserted {
        for c in collections.iter_mut() {
            if let Some(children) = find_folder_mut(&mut c.children, &parent_id) {
                children.push(folder.clone());
                inserted = true;
                break;
            }
        }
    }

    if !inserted {
        return Err(AppError::Collection(format!(
            "Parent not found: {}",
            parent_id
        )));
    }

    save_collections(&collections)?;
    Ok(folder)
}

#[tauri::command]
pub fn save_request(parent_id: String, request: SaveRequestPayload) -> Result<CollectionItem, AppError> {
    let mut collections = load_collections()?;

    let (id, is_update) = match &request.id {
        Some(id) if !id.is_empty() => (id.clone(), true),
        _ => (generate_id("req"), false),
    };

    let item = CollectionItem::Request {
        id: id.clone(),
        name: request.name,
        method: request.method,
        url: request.url,
        params: request.params,
        headers: request.headers,
        body: request.body,
    };

    if is_update {
        find_and_delete(&mut collections, &id);
    }

    let mut done = false;
    if let Some(col) = find_collection_mut(&mut collections, &parent_id) {
        col.children.push(item.clone());
        done = true;
    }
    if !done {
        for c in collections.iter_mut() {
            if let Some(children) = find_folder_mut(&mut c.children, &parent_id) {
                children.push(item.clone());
                done = true;
                break;
            }
        }
    }

    if !done {
        return Err(AppError::Collection(format!("Parent not found: {}", parent_id)));
    }

    save_collections(&collections)?;
    Ok(item)
}

#[tauri::command]
pub fn rename_item(id: String, new_name: String) -> Result<(), AppError> {
    let mut collections = load_collections()?;
    if find_and_rename(&mut collections, &id, &new_name) {
        save_collections(&collections)?;
        Ok(())
    } else {
        Err(AppError::Collection(format!("Item not found: {}", id)))
    }
}

#[tauri::command]
pub fn delete_item(id: String) -> Result<(), AppError> {
    let mut collections = load_collections()?;
    if find_and_delete(&mut collections, &id) {
        save_collections(&collections)?;
        Ok(())
    } else {
        Err(AppError::Collection(format!("Item not found: {}", id)))
    }
}
