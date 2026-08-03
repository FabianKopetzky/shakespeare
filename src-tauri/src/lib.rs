#[cfg_attr(mobile, tauri::mobile_entry_point)]
use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn write_json_to_project(
    project_path: String,
    relative_file: String,
    contents: String,
) -> Result<(), String> {
    let mut path = PathBuf::from(project_path);
    path.push(relative_file);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_json_files(project_dir: String) -> Result<(), String> {
    let dir = PathBuf::from(project_dir);
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        let should_remove = path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|name| {
                let lower = name.to_lowercase();
                lower.ends_with(".json") || lower.ends_with(".json.meta")
            })
            .unwrap_or(false);

        if path.is_file() && should_remove {
            fs::remove_file(&path).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn resolve_project_path(base: String, subfolder: String) -> Result<String, String> {
    let base_path = PathBuf::from(&base);
    if !base_path.exists() {
        return Err(format!("Base path does not exist: {}", base));
    }

    let target = base_path.join(&subfolder);
    if !target.exists() {
        fs::create_dir_all(&target).map_err(|e| e.to_string())?;
    }

    target
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Target path contains invalid UTF-8".to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            write_json_to_project,
            clear_json_files,
            resolve_project_path
        ])
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
