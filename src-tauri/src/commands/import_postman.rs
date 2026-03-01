use crate::errors::AppError;
use crate::models::{Collection, CollectionItem};
use crate::services::{load_collections, save_collections};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

fn generate_id(prefix: &str) -> String {
    format!("{}-{}", prefix, Uuid::new_v4().simple())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostmanImportResult {
    pub collections: usize,
    pub requests: usize,
}

#[tauri::command]
pub fn import_postman(json: String, append: bool) -> Result<PostmanImportResult, AppError> {
    let v: Value = serde_json::from_str(&json).map_err(|e| AppError::Collection(e.to_string()))?;
    let postman_collection = parse_postman_collection(&v)?;
    let mut collections = if append {
        load_collections().unwrap_or_default()
    } else {
        vec![]
    };
    let (new_cols, request_count) = convert_postman_to_saola(postman_collection);
    let new_count = new_cols.len();
    for col in new_cols {
        collections.push(col);
    }
    save_collections(&collections)?;
    Ok(PostmanImportResult {
        collections: new_count,
        requests: request_count,
    })
}

fn parse_postman_collection(v: &Value) -> Result<(String, Vec<Value>), AppError> {
    let info = v.get("info").ok_or_else(|| AppError::Collection("Missing info".into()))?;
    let name = info
        .get("name")
        .and_then(|n| n.as_str())
        .unwrap_or("Imported")
        .to_string();
    let empty: Vec<Value> = vec![];
    let items = v.get("item").and_then(|i| i.as_array()).unwrap_or(&empty);
    Ok((name, items.clone()))
}

fn convert_postman_to_saola((name, items): (String, Vec<Value>)) -> (Vec<Collection>, usize) {
    let id = generate_id("col");
    let mut request_count = 0;
    let children = convert_items(items, &mut request_count);
    let collection = Collection {
        id: id.clone(),
        name,
        children,
    };
    (vec![collection], request_count)
}

fn convert_items(items: Vec<Value>, count: &mut usize) -> Vec<CollectionItem> {
    let mut result = vec![];
    for item in items {
        if item.get("request").is_some() {
            if let Some(req) = convert_request(item) {
                result.push(req);
                *count += 1;
            }
        } else if let Some(children) = item.get("item").and_then(|i| i.as_array()) {
            if let Some(folder) = convert_folder(
                item.get("name").and_then(|n| n.as_str()).unwrap_or("Folder"),
                children.to_vec(),
                count,
            ) {
                result.push(folder);
            }
        }
    }
    result
}

fn convert_folder(name: &str, items: Vec<Value>, count: &mut usize) -> Option<CollectionItem> {
    let id = generate_id("fld");
    let children = convert_items(items, count);
    Some(CollectionItem::Folder {
        id,
        name: name.to_string(),
        children,
    })
}

fn convert_request(item: Value) -> Option<CollectionItem> {
    let name = item.get("name").and_then(|n| n.as_str()).unwrap_or("Request").to_string();
    let req_val = item.get("request")?.clone();
    let method = req_val
        .get("method")
        .and_then(|m| m.as_str())
        .unwrap_or("GET")
        .to_uppercase();
    let url = extract_url(&req_val)?;
    let (params, headers, body) = extract_params_and_body(&req_val);
    let id = generate_id("req");
    Some(CollectionItem::Request {
        id,
        name,
        method,
        url,
        params,
        headers,
        body,
    })
}

fn extract_url(req: &Value) -> Option<String> {
    // Postman shorthand: request can be a string (the URL)
    if let Value::String(s) = req {
        return Some(s.clone());
    }
    let url_val = req.get("url")?;
    match url_val {
        Value::String(s) => Some(s.clone()),
        Value::Object(obj) => {
            obj.get("raw")
                .and_then(|r| r.as_str())
                .map(String::from)
                .or_else(|| {
                    let host = obj.get("host").and_then(|h| h.as_array())?;
                    let host_str: String = host
                        .iter()
                        .filter_map(|v| v.as_str())
                        .collect::<Vec<_>>()
                        .join(".");
                    let path = obj.get("path").and_then(|p| p.as_array())?;
                    let path_str: String = path
                        .iter()
                        .filter_map(|v| v.as_str())
                        .collect::<Vec<_>>()
                        .join("/");
                    let mut u = if host_str.starts_with("http") {
                        format!("{}/{}", host_str, path_str)
                    } else {
                        format!("https://{}/{}", host_str, path_str)
                    };
                    if let Some(query) = obj.get("query").and_then(|q| q.as_array()) {
                        let qs: Vec<String> = query
                            .iter()
                            .filter_map(|q| {
                                let k = q.get("key")?.as_str()?;
                                let v = q.get("value").and_then(|v| v.as_str()).unwrap_or("");
                                if k.is_empty() {
                                    None
                                } else {
                                    Some(format!("{}={}", k, v))
                                }
                            })
                            .collect();
                        if !qs.is_empty() {
                            u.push('?');
                            u.push_str(&qs.join("&"));
                        }
                    }
                    Some(u)
                })
        }
        _ => None,
    }
}

fn extract_headers(req: &Value) -> Vec<crate::models::HeaderPair> {
    let mut result = vec![];
    let empty: Vec<serde_json::Value> = vec![];
    let headers = req
        .get("header")
        .and_then(|h| h.as_array())
        .unwrap_or(&empty);
    for h in headers {
        let key = h.get("key").and_then(|k| k.as_str()).unwrap_or("").to_string();
        let value = h.get("value").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let disabled = h.get("disabled").and_then(|d| d.as_bool()).unwrap_or(false);
        if !key.is_empty() {
            result.push(crate::models::HeaderPair {
                key,
                value,
                enabled: !disabled,
            });
        }
    }
    result
}

fn extract_params_and_body(
    req: &Value,
) -> (
    Vec<crate::models::ParamPair>,
    Vec<crate::models::HeaderPair>,
    Option<String>,
) {
    let headers = extract_headers(req);
    let mut params = vec![];
    let url_val = req.get("url");
    if let Some(Value::Object(obj)) = url_val {
        if let Some(query) = obj.get("query").and_then(|q| q.as_array()) {
            for q in query {
                let key = q.get("key").and_then(|k| k.as_str()).unwrap_or("").to_string();
                let value = q.get("value").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let disabled = q.get("disabled").and_then(|d| d.as_bool()).unwrap_or(false);
                if !key.is_empty() {
                    params.push(crate::models::ParamPair {
                        key,
                        value,
                        enabled: !disabled,
                    });
                }
            }
        }
    }
    if params.is_empty() {
        params.push(crate::models::ParamPair {
            key: String::new(),
            value: String::new(),
            enabled: true,
        });
    }
    let body = req
        .get("body")
        .and_then(|b| {
            let mode = b.get("mode").and_then(|m| m.as_str()).unwrap_or("raw");
            if mode == "raw" {
                b.get("raw").and_then(|r| r.as_str()).map(String::from)
            } else if mode == "urlencoded" {
                let urlencoded = b.get("urlencoded").and_then(|u| u.as_array())?;
                let pairs: Vec<String> = urlencoded
                    .iter()
                    .filter_map(|p| {
                        let k = p.get("key")?.as_str()?;
                        let v = p.get("value").and_then(|v| v.as_str()).unwrap_or("");
                        Some(format!("{}={}", k, v))
                    })
                    .collect();
                Some(pairs.join("&"))
            } else {
                None
            }
        });
    (params, headers, body)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_minimal_postman_collection() {
        let json = r#"{"info":{"name":"Test"},"item":[]}"#;
        let v: Value = serde_json::from_str(json).unwrap();
        let (name, items) = parse_postman_collection(&v).unwrap();
        assert_eq!(name, "Test");
        assert!(items.is_empty());
    }

    #[test]
    fn parse_postman_with_folder() {
        let json = r#"{
            "info":{"name":"API"},
            "item":[
                {"name":"Folder1","item":[
                    {"name":"Req1","request":{"method":"GET","url":"https://example.com"}}
                ]}
            ]
        }"#;
        let v: Value = serde_json::from_str(json).unwrap();
        let (name, items) = parse_postman_collection(&v).unwrap();
        assert_eq!(name, "API");
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].get("name").and_then(|n|n.as_str()), Some("Folder1"));
    }

    #[test]
    fn parse_postman_string_url_request() {
        let json = r#"{
            "info":{"name":"C"},
            "item":[{"name":"R","request":{"method":"POST","url":"https://api.test/path"}}]
        }"#;
        let v: Value = serde_json::from_str(json).unwrap();
        let (_, items) = parse_postman_collection(&v).unwrap();
        let req = convert_request(items[0].clone()).unwrap();
        if let CollectionItem::Request { method, url, .. } = req {
            assert_eq!(method, "POST");
            assert_eq!(url, "https://api.test/path");
        } else {
            panic!("Expected request");
        }
    }

    #[test]
    fn parse_invalid_json_fails() {
        let json = "not json";
        let result: Result<Value, _> = serde_json::from_str(json);
        assert!(result.is_err());
    }
}
