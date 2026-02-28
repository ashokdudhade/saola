use aes_gcm::{aead::Aead, Aes256Gcm, KeyInit};
use sha2::{Sha256, Digest};

/// E2EE layer using AES-256-GCM. Master password derives a key via SHA-256.
pub struct CryptoService;

impl CryptoService {
    pub fn encrypt(plaintext: &[u8], master_password: &str) -> Result<Vec<u8>, String> {
        let key = Self::derive_key(master_password);
        let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| e.to_string())?;
        let nonce: [u8; 12] = rand::random(); // aes-gcm nonce is 96 bits
        let ciphertext = cipher
            .encrypt((&nonce).into(), plaintext)
            .map_err(|e| e.to_string())?;
        let mut result = nonce.to_vec();
        result.extend(ciphertext);
        Ok(result)
    }

    pub fn decrypt(ciphertext: &[u8], master_password: &str) -> Result<Vec<u8>, String> {
        if ciphertext.len() < 12 {
            return Err("Invalid ciphertext".to_string());
        }
        let (nonce_bytes, ct) = ciphertext.split_at(12);
        let key = Self::derive_key(master_password);
        let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| e.to_string())?;
        let nonce = aes_gcm::aead::generic_array::GenericArray::from_slice(nonce_bytes);
        cipher.decrypt(nonce, ct).map_err(|e| e.to_string())
    }

    fn derive_key(master_password: &str) -> [u8; 32] {
        let mut hasher = Sha256::new();
        hasher.update(master_password.as_bytes());
        hasher.update(b"saola-v1");
        hasher.finalize().into()
    }
}
