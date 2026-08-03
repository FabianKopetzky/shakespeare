#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod menu;
use menu::create_menu;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // create menu
            let menu = create_menu(app.handle())?;
            app.set_menu(menu)?;

            app.on_menu_event(move |_app, event| match event.id().as_ref() {
                "new_project" => println!("New Project"),
                "open_project" => println!("Open Project"),
                "open_recent" => println!("Open Recent"),
                _ => {}
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
