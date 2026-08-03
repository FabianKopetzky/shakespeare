use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Wry,
};

pub fn create_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<Wry>> {
    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "new_project", "New Project", true, None::<&str>)?,
            &MenuItem::with_id(app, "open_project", "Open Project", true, None::<&str>)?,
            &MenuItem::with_id(app, "recent_projects", "Open Recent", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, None)?,
        ],
    )?;

    return Menu::with_items(app, &[&file_menu]);
}
