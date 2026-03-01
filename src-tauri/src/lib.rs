mod commands;
mod errors;
mod models;
mod services;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_collections,
            commands::create_collection,
            commands::create_folder,
            commands::save_request,
            commands::rename_item,
            commands::delete_item,
            commands::send_request,
            commands::get_environments,
            commands::get_active_environment,
            commands::create_environment,
            commands::update_environment,
            commands::delete_environment,
            commands::set_active_environment,
            commands::configure_s3,
            commands::get_storage_provider,
            commands::set_storage_provider,
            commands::sync_push,
            commands::sync_pull,
            commands::encrypt_collections,
            commands::decrypt_collections,
            commands::import_postman,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
