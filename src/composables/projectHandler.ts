import { useAppStore } from "../stores/app";
import { useContentStore } from "../stores/content";
import { useCompiler } from "./compiler";
import { useWidget } from "./widget";

import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, readDir, readTextFile, remove, rename, writeTextFile } from "@tauri-apps/plugin-fs";

import { isValidProject } from "./projectValidator";
import { invoke } from "@tauri-apps/api/core";
import defaultSettings from "../utils/settings";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export const SHAKESPEARE_VERSION = "1.0.1";
export interface ProjectFileEntry {
    name: string,
    path: string
}

export function useProjectHandler() {
    const contentStore = useContentStore();
    const appStore = useAppStore();
    const compiler = useCompiler();

    const { displayError, displaySuccess } = useWidget();

    //* UTILS
    async function getProjectDir(): Promise<string> {
        if(!appStore.isNativeApp) return '';
        const base = await appDataDir();
        const dir = await join(base, 'Projects');
        if(!await exists(dir)) {
            await mkdir(dir, { recursive: true});
        }
        return dir;
    }
    async function getProjectPath(projectName: string): Promise<string> {
        if(!appStore.isNativeApp) return '';
        const base = await getProjectDir();
        return await join(base, `${projectName}.json`);
    }
    async function getUnityStoryPath(): Promise<string> {
        if(!contentStore.settings.unityStreamingAssetsPath || contentStore.settings.unityStreamingAssetsPath.length <= 0) return '';
        const base = await getUnityProjectPath();
        try {
            return await invoke<string>('resolve_project_path', { base: base, subfolder: 'Stories'});
        } catch(err) {
            console.error('Error resolving unity project path:', err);
            return '';
        }
    }
    async function getUnityProjectPath(): Promise<string> {
        if(!contentStore.settings.unityStreamingAssetsPath || contentStore.settings.unityStreamingAssetsPath.length <= 0) return '';
        
        try {
            return await invoke<string>('resolve_project_path', { base: contentStore.settings.unityStreamingAssetsPath, subfolder: 'Shakespeare'});
        } catch(err) {
            console.error('Error resolving unity project path:', err);
            return '';
        }
    }
    async function fileExists(path: string): Promise<boolean> {
        if(!appStore.isNativeApp) return false;
        return await exists(path);
    }
    async function writeJson(content: string, path: string) {
        if(!appStore.isNativeApp) return;
        await writeTextFile(path, content);
    }
    async function getProjects(): Promise<ProjectFileEntry[]> {
        if(!appStore.isNativeApp) return [];
        const dir = await getProjectDir();
        const entries = await readDir(dir);

        const jsonFiles = entries.filter(e => e.isFile && e.name.toLowerCase().endsWith(".json"));

        const projects = await Promise.all(jsonFiles.map(async (e) => ({
            name: e.name.substring(0, e.name.length - 5),
            path: await(join(dir, e.name))
        })));

        return projects;
    }

    async function isProjectNameTaken(name: string, ignorePath?: string): Promise<boolean> {
        const projects = await getProjects();
        const lower = name.toLowerCase();
        return projects.some(p => p.path !== ignorePath && p.name.toLowerCase() === lower);
    }

    async function removeOldProjectFileIfExistsUnity(): Promise<void> {
        if(!appStore.isNativeApp) return;

        const projectDir = await getUnityProjectPath();
        if(!projectDir || projectDir.length <= 0) return;

        await invoke("clear_json_files", { projectDir: projectDir });
    }
    async function removeOldStoryFilesIfExistUnity(): Promise<void> {
        if(!appStore.isNativeApp) return;

        const storyDir = await getUnityStoryPath();
        if(!storyDir || storyDir.length <= 0) return;

        await invoke("clear_json_files", {  projectDir: storyDir });
    }

    function loadProjectDataToStore(project: any, fallbackTitle: string, fallbackAuthor: string): boolean {
        try {
            if (!project) {
                // reset properties
                contentStore.projectTitle = fallbackTitle;
                contentStore.projectAuthor = fallbackAuthor;

                contentStore.settings = structuredClone(defaultSettings);
                contentStore.meta = {
                    createdAt: new Date(Date.now()).toLocaleDateString(),
                    lastEdited: new Date(Date.now()).toLocaleDateString(),
                    version: SHAKESPEARE_VERSION
                };

                contentStore.dialogues = [];
                contentStore.stories = [];
                contentStore.storyNodes = {};

                contentStore.languages = [{ code: 'default', display: 'English', icon: 'flagpack:gb-ukm', isDefault: true }];
                contentStore.textColors = [];
                contentStore.storyVariables = [];
                contentStore.customFields = [];
                contentStore.events = [];
                contentStore.computedProperties = [];

                appStore.projectLoaded = true;
                return true;
            }

            if (!isValidProject(project)) {
                appStore.projectLoaded = false;
                return false;
            }

            // import data
            contentStore.projectTitle = project.projectTitle ?? fallbackTitle;
            contentStore.projectAuthor = project.projectAuthor ?? fallbackAuthor;

            contentStore.settings = project.settings ?? structuredClone(defaultSettings);
            contentStore.meta = project.meta ?? {
                createdAt: new Date(Date.now()).toLocaleDateString(),
                lastEdited: new Date(Date.now()).toLocaleDateString(),
                version: SHAKESPEARE_VERSION
            };

            contentStore.dialogues = project.dialogues ?? [];
            contentStore.stories = project.stories ?? [];
            contentStore.storyNodes = project.storyNodes ?? {};

            contentStore.textColors = project.colors ?? [];
            contentStore.languages = project.languages ?? [];
            contentStore.storyVariables = project.storyVariables ?? [];
            contentStore.customFields = project.customFields ?? [];
            contentStore.events = project.events ?? [];
            contentStore.computedProperties = project.computedProperties ?? [];

            appStore.projectLoaded = true;
            return true;
        } catch (err) {
            console.error('Failed to load project data:', err);
            appStore.projectLoaded = false;
            return false;
        }
    }

    function unloadProject(): void {
        // reuse the reset logic, then mark the app as having no project open
        loadProjectDataToStore(null, '', '');
        appStore.projectLoaded = false;
        appStore.currentProjectPath = '';
    }

    //* PROJECT HANDLING
    function downloadFile(content: string, type: 'application/json' | 'text/csv', fileName: string): void {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function exportProject(): void {
        const data = compiler.getProjectData();
        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', `${contentStore.projectTitle || "project"}.json`);

        displaySuccess(`Successfully exported & downloaded project ${contentStore.projectTitle}`);
    }
    async function importProject(project: any): Promise<boolean> {
        
        if(appStore.isNativeApp) {
            const path = await getProjectPath(project.projectTitle ?? 'My project');
            if(await fileExists(path)) {
                displayError(`A project '${project.projectTitle ?? 'My project'}' already exists at ${path}`);
                return false;
            }
        }

        const res = loadProjectDataToStore(project, 'My project', 'Default author');
        if(!res) {
            displayError("Could not parse project data. Please verify your project file");
            return false;
        }

        if(appStore.isNativeApp) {
            // also directly create a file
            const path = await getProjectPath(project.projectTitle ?? 'My project');
            appStore.currentProjectPath = path;
            await saveCurrentProject(path);
        }
        return true;
    }
    async function createProject(title: string, author: string): Promise<boolean> {
        
        if(appStore.isNativeApp) {
            const path = await getProjectPath(title);
            if(await fileExists(path)) {
                displayError(`A project '${title}' already exists at ${path}`);
                return false;
            }
        }

        const res = loadProjectDataToStore(null, title, author);
        if(!res) {
            displayError(`An error occurred creating project ${title}`);
            return false;
        }

        if(appStore.isNativeApp) {
            // also directly create a file
            const path = await getProjectPath(title);
            appStore.currentProjectPath = path;
            await saveCurrentProject(path);
        }

        return true;
    }
    async function renameCurrentProject(newTitle: string, newAuthor: string): Promise<boolean> {
        if(!appStore.projectLoaded) {
            displayError('Could not rename project: No project is currently open');
            return false;
        }

        const oldTitle = contentStore.projectTitle;
        const oldAuthor = contentStore.projectAuthor;

        if(!appStore.isNativeApp) {
            contentStore.projectTitle = newTitle;
            contentStore.projectAuthor = newAuthor;
            displaySuccess(`Successfully renamed project to '${newTitle}'`);
            return true;
        }

        const oldPath = appStore.currentProjectPath;
        let renamedOnDisk = false;
        let newPath = oldPath;

        try {
            newPath = await getProjectPath(newTitle);

            if(newPath !== oldPath) {
                if(await isProjectNameTaken(newTitle, oldPath)) {
                    displayError(`Could not rename project: A project named '${newTitle}' already exists`);
                    return false;
                }

                
                if(oldPath && await fileExists(oldPath)) {
                    await rename(oldPath, newPath);
                    renamedOnDisk = true;
                }
            }

            contentStore.projectTitle = newTitle;
            contentStore.projectAuthor = newAuthor;
            appStore.currentProjectPath = newPath;

           
            if(!await saveCurrentProject(newPath)) {
                throw new Error('The project file could not be written');
            }

            displaySuccess(`Successfully renamed project to '${newTitle}'`);
            return true;
        } catch(err) {
            console.error('Failed to rename project:', err);

            
            contentStore.projectTitle = oldTitle;
            contentStore.projectAuthor = oldAuthor;
            appStore.currentProjectPath = oldPath;

            if(renamedOnDisk) {
                try {
                    await rename(newPath, oldPath);
                } catch(rollbackErr) {
                    console.error('Failed to roll back project file rename:', rollbackErr);
                }
            }

            displayError(`An error occurred renaming project '${oldTitle}': ${err}`);
            return false;
        }
    }
    async function openProjectInExplorer(path: string): Promise<boolean> {
        if(!appStore.isNativeApp) return false;
 
        if(!path || path.length <= 0) {
            displayError('Could not open project location: No project is currently open');
            return false;
        }
 
        try {
            if(!await fileExists(path)) {
                displayError(`Could not open project location: The file ${path} no longer exists`);
                return false;
            }
 
            await revealItemInDir(path);
            return true;
        } catch(err) {
            console.error('Failed to reveal project in explorer:', err);
            displayError(`An error occurred opening the project location: ${err}`);
            return false;
        }
    }

    async function deleteProject(projectName: string): Promise<boolean> {
        
        if(!appStore.isNativeApp) {
            if(!appStore.projectLoaded || contentStore.projectTitle !== projectName) {
                displayError(`Could not delete project '${projectName}': It is not currently open`);
                return false;
            }

            unloadProject();
            displaySuccess(`Project '${projectName}' was removed from the editor. Previously exported files are not affected`);
            return true;
        }

        try {
            const projects = await getProjects();
            const entry = projects.find(p => p.name === projectName);
            if(!entry) {
                displayError(`Could not delete project '${projectName}': The project file was not found`);
                return false;
            }

            await remove(entry.path);

            if(appStore.currentProjectPath === entry.path) {
                unloadProject();
            }

            displaySuccess(`Successfully deleted project '${projectName}'`);
            return true;
        } catch(err) {
            console.error('Failed to delete project:', err);
            displayError(`An error occurred deleting project '${projectName}': ${err}`);
            return false;
        }
    }
    async function openProject(path: string): Promise<boolean> {
        if(!appStore.isNativeApp) return false;
        try {
            const json = await readTextFile(path);
            const data = JSON.parse(json);

            const res = loadProjectDataToStore(data, 'My project', 'Default author');
            if(!res) {
                displayError("Could not parse project data. Please verify your project file");
                return false;
            }

            displaySuccess(`Successfully opened project ${data.projectTitle}`);
            appStore.currentProjectPath = path;
            return true;
        } catch(err) {
            displayError(`An error occurred loading from ${path}: ${err}`);
            return false;
        }
    }
    async function saveCurrentProject(path: string, logSuccess: boolean = false): Promise<boolean> {
        if(!appStore.isNativeApp) return false;
        if(!appStore.projectLoaded) return false;

        if(!path || path.length <= 0) {
            displayError(`Could not save project: Invalid project path ${path}`);
            return false;
        }

        const data = compiler.getProjectData();
        const json = JSON.stringify(data);
        await writeJson(json, path);

        if(logSuccess) {
            displaySuccess(`Successfully saved project at ${path}`);
        }

        return true;
    }

    //* DOWNLOAD HANDLING
    function downloadCompiledProject(): void {
        const data = compiler.compileProjectMain();
        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', 'main.json');
        
        displaySuccess(
            `Successfully compiled main file for project '${contentStore.projectTitle}'`,
        );
    }
    function downloadCompiledStories(): void {
        const data = compiler.compileStories();

        for(const key of Object.keys(data)) {
            const value = data[key];
            const json = JSON.stringify(value);
            downloadFile(json, 'application/json', `${key}.json`);
        }
        displaySuccess(
            `Successfully compiled stories for project '${contentStore.projectTitle}'`,
        );
    }

    //* BUILD HANDLING

    async function buildProject(): Promise<boolean> {
        if(!appStore.isNativeApp) return false;
        
        const path: string = await getUnityProjectPath();
        if(!path || path.length <= 0) {
            displayError(`Error building project: The path ${path} is not valid!`);
            return false;
        }

        await removeOldProjectFileIfExistsUnity();
        const data = compiler.compileProjectMain();
        const json = JSON.stringify(data);

        await invoke("write_json_to_project", { projectPath:  path, relativeFile: 'main.json', contents: json});

        displaySuccess(`Successfully compiled and built main file for ${contentStore.projectTitle} to ${path}`);

        return true;
    }
    async function buildStories(): Promise<boolean> {
        if(!appStore.isNativeApp) return false;

        const path: string = await getUnityStoryPath();
        if(!path || path.length <= 0) {
            displayError(`Error building stories: The path ${path} is not valid!`);
            return false;
        }

        await removeOldStoryFilesIfExistUnity();
        const data = compiler.compileStories();
        
        for(const key of Object.keys(data)) {
            const value = data[key];
            const json = JSON.stringify(value);
            
            await invoke("write_json_to_project", { projectPath:  path, relativeFile: `${key}.json`, contents: json});
        }
        displaySuccess(
            `Successfully compiled stories for project '${contentStore.projectTitle}' to ${path}`,
        );

        return true;
    }


    return {
        exportProject,
        importProject,
        createProject,
        renameCurrentProject,
        deleteProject,
        saveCurrentProject,
        openProjectInExplorer,
        unloadProject,
        getProjects,
        openProject,
        downloadCompiledProject,
        downloadCompiledStories,
        buildProject,
        buildStories,
        downloadFile
    }
}