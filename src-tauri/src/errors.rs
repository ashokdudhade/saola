#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(String),
    #[error("HTTP request failed: {0}")]
    Http(String),
    #[error("Invalid URL: {0}")]
    InvalidUrl(String),
    #[error("Collection error: {0}")]
    Collection(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Http(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Collection(e.to_string())
    }
}
