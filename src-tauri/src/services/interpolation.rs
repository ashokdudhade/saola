use crate::models::{Environment, HeaderPair};
use std::collections::HashMap;

/// Replace {{variable}} with values from the environment.
pub fn interpolate(s: &str, env: &Environment) -> String {
    let vars: HashMap<&str, &str> = env
        .variables
        .iter()
        .map(|v| (v.key.as_str(), v.value.as_str()))
        .collect();
    let mut result = s.to_string();
    for (key, value) in vars {
        let placeholder = format!("{{{{{}}}}}", key);
        result = result.replace(&placeholder, value);
    }
    result
}

pub fn interpolate_header_pair(p: &HeaderPair, env: &Environment) -> HeaderPair {
    HeaderPair {
        key: interpolate(&p.key, env),
        value: interpolate(&p.value, env),
        enabled: p.enabled,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::EnvVariable;

    #[test]
    fn interpolate_replaces_variables() {
        let env = Environment {
            id: "x".into(),
            name: "Test".into(),
            variables: vec![
                EnvVariable {
                    key: "base".into(),
                    value: "https://api.example.com".into(),
                },
                EnvVariable {
                    key: "key".into(),
                    value: "secret123".into(),
                },
            ],
        };
        assert_eq!(
            interpolate("{{base}}/users", &env),
            "https://api.example.com/users"
        );
        assert_eq!(
            interpolate("Bearer {{key}}", &env),
            "Bearer secret123"
        );
    }
}

