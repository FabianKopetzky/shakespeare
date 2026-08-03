import { useAppStore } from "../stores/app";
import { useContentStore } from "../stores/content";
import { useCompiler } from "./compiler";

export function useProjectHandler() {
    const contentStore = useContentStore();
    const appStore = useAppStore();
    const compiler = useCompiler();

    //* PROJECT HANDLING
    function downloadFile(content: string, type: 'application/json', fileName: string): void {
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
    }
    function importProject(project: any): boolean {
        try {
            contentStore.projectTitle = project.projectTitle ?? 'My project';
            contentStore.projectAuthor = project.projectAuthor ?? 'Author';

            contentStore.dialogues = project.dialogues ?? [];
            contentStore.stories = project.stories ?? [];
            contentStore.storyNodes = project.storyNodes ?? {};

            contentStore.textColors = project.colors ?? [];
            contentStore.languages = project.languages ?? [];
            contentStore.storyVariables = project.storyVariables ?? [];

            appStore.projectLoaded = true;
            return true;
        } catch (err) {
            console.error(`Error importing data: ${err}`);
            return false;
        }
    }
    function createProject(title: string, author: string): void {
        contentStore.projectTitle = title;
        contentStore.projectAuthor = author;

        contentStore.dialogues = [];
        contentStore.stories = [];
        contentStore.storyNodes = {};

        contentStore.languages = [{ code: 'default', display: 'English', isDefault: true }];
        contentStore.textColors = [];
        contentStore.storyVariables = [];

        appStore.projectLoaded = true;
    }

    //* DOWNLOAD HANDLING
    function downloadCompiledProject(): boolean {
        const data = compiler.compileProjectMain();
        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', 'main.json');
        return true;
    }
    function downloadCompiledStories(): boolean {
        const data = compiler.compileStories();

        for(const key of Object.keys(data)) {
            const value = data[key];
            const json = JSON.stringify(value);
            downloadFile(json, 'application/json', `${key}.json`);
        }
        return true;
    }

    //* BUILD HANDLING

    function buildProject(): boolean {
        const data = compiler.compileProjectMain();
        // TODO build directly to unity in tauri
        return true;
    }
    function buildStories(): boolean {
        const data = compiler.compileStories();
        // TODO build directly to unity in tauri
        return true;
    }


    return {
        exportProject,
        importProject,
        createProject,
        downloadCompiledProject,
        downloadCompiledStories,
        buildProject,
        buildStories
    }
}