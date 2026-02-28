use crate::errors::AppError;
use crate::models::{HeaderPair, HttpResponse};
use reqwest::Client;
use std::time::Duration;

pub struct RequestService {
    client: Client,
}

impl RequestService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("HTTP client should build");
        Self { client }
    }

    pub async fn send(
        &self,
        method: &str,
        url: &str,
        headers: &[HeaderPair],
        body: Option<&str>,
    ) -> Result<HttpResponse, AppError> {
        let url: reqwest::Url = url
            .parse()
            .map_err(|e: url::ParseError| AppError::InvalidUrl(e.to_string()))?;

        let mut request = match method.to_uppercase().as_str() {
            "GET" => self.client.get(url),
            "POST" => self.client.post(url),
            "PUT" => self.client.put(url),
            "PATCH" => self.client.patch(url),
            "DELETE" => self.client.delete(url),
            "HEAD" => self.client.head(url),
            "OPTIONS" => self.client.request(reqwest::Method::OPTIONS, url),
            _ => return Err(AppError::Http(format!("Unsupported method: {}", method))),
        };

        for h in headers.iter().filter(|h| h.enabled) {
            request = request.header(&h.key, &h.value);
        }

        if let Some(b) = body {
            if !b.trim().is_empty() {
                request = request.body(b.to_string());
            }
        }

        let response = request.send().await?;
        let status = response.status();
        let status_text = status.canonical_reason().unwrap_or("").to_string();
        let resp_headers: Vec<HeaderPair> = response
            .headers()
            .iter()
            .map(|(k, v)| HeaderPair {
                key: k.as_str().to_string(),
                value: v.to_str().unwrap_or("").to_string(),
                enabled: true,
            })
            .collect();
        let body_text = response.text().await?;

        Ok(HttpResponse {
            status: status.as_u16(),
            status_text,
            headers: resp_headers,
            body: body_text,
        })
    }
}
