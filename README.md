# Shakespeare

Shakespeare is a web based story and dialogue editor that allows users to visually create story graphs, write dialogue and include logic in their stories like branches.

## Unity support

Shakespeare compiles stories, logic and project data into structured JSON files. These files can be used anywhere, but are particularly optimized for implementing them in Unity. The **Shakespeare Unity Package** can read these files and handle them in game without any additional code needed.

## Features

**What can Shakespeare do for you for your project?**

Shakespeare has very powerful features that let you implement the story YOU want in Unity - and depending on the complexity of your story, you won't even need a single line of code for it.

### Base Features (no additional unity code required)

- Write dialogues
- Rich text editor (bold, italic, color definitions)
- Create story flows with branches and dialogue options
- Add translations and localization
- Add and mutate variables in story flows
- Use variables directly in your dialogue text
- Use conditions to branch stories
- Include random dialogue and random branches in your story

### Advanced Features (custom unity code required)

- Fire events (with and without parameters) from your story that you can handle in unity
- Extend dialogue, story, sentence and branch models to add your own fields and data to the stories (and handle them in unity)
- Add computed properties (with and without parameters) which values are resolved at runtime from your unity code

## Shakespeare Unity Package

The shakespeare unity package handles loading and parsing the compiled files for you. With its base components, you can create and customize story telling without writing a single line of code. However, most controller and GUI components can be extended, derived or entirely replaced by your custom implementation. For more infos on the package itself, refer to the package itself in the unity asset store.

## Project

The project is written Vue.js and Typescript, using the Nuxt UI component library. Tauri, a lightweight native wrapper written in Rust is used to run the app locally on your machine.

### Run locally

To run the project locally without compiling or building it, clone the repository. `cd` into the folder and run `npm install` to install dependencies. You have the option to run it in your browser and in the native Tauri shell.

**Run in browser**<br>
After installing the dependencies, run `npm run dev`. The app will be available at `localhost:5173`.

**Run native app**<br>
Make sure you have the rust compiler installed on your machine. Run `npm run tauri dev` and the app will open up. Additionally, it is available on `localhost:5173`.
