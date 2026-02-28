use crate::services::RequestService;
use std::sync::Arc;

pub struct AppState {
    pub request_service: Arc<RequestService>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            request_service: Arc::new(RequestService::new()),
        }
    }
}
