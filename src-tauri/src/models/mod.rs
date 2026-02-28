use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub children: Vec<CollectionItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum CollectionItem {
    Folder {
        id: String,
        name: String,
        children: Vec<CollectionItem>,
    },
    Request {
        id: String,
        name: String,
        method: String,
        url: String,
        #[serde(default)]
        params: Vec<ParamPair>,
        #[serde(default)]
        headers: Vec<HeaderPair>,
        #[serde(default)]
        body: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderPair>,
    pub params: Vec<ParamPair>,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderPair {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamPair {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<HeaderPair>,
    pub body: String,
}
