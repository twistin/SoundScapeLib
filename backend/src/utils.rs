use uuid::Uuid;

pub fn generate_id() -> Uuid {
    Uuid::new_v4()
}

pub fn validate_uuid(uuid_str: &str) -> Result<Uuid, uuid::Error> {
    Uuid::parse_str(uuid_str)
}

pub fn safe_filename(filename: &str) -> String {
    filename
        .chars()
        .map(|c| match c {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '.' | '-' | '_' => c,
            _ => '_',
        })
        .collect()
}
