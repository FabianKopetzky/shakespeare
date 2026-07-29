import { useAppStore } from "../stores/app";
import { useContentStore } from "../stores/content";

export function useProjectHandler() {
    const contentStore = useContentStore();
    const appStore = useAppStore();

    function exportProject(): void {
        const data = {
            projectTitle: contentStore.projectTitle,
            projectAuthor: contentStore.projectAuthor,

            dialogues: contentStore.dialogues,
            stories: contentStore.stories,
            storyNodes: contentStore.storyNodes,

            colors: contentStore.textColors,
            templating: contentStore.templatingVariables,
            languages: contentStore.languages,
            storyVariables: contentStore.storyVariables
        }

        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${contentStore.projectTitle || "project"}.json`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    function importProject(project: any): boolean {
        try {
            contentStore.projectTitle = project.projectTitle ?? 'My project';
            contentStore.projectAuthor = project.projectAuthor ?? 'Author';

            contentStore.dialogues = project.dialogues ?? [];
            contentStore.stories = project.stories ?? [];
            contentStore.storyNodes = project.storyNodes ?? {};
            
            contentStore.textColors = project.colors ?? [];
            contentStore.templatingVariables = project.templating ?? [];
            contentStore.languages = project.languages ?? [];
            contentStore.storyVariables = project.storyVariables ?? [];
            
            appStore.projectLoaded = true;
            return true;
        } catch(err) {
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
        
        contentStore.languages = [{code: 'default', display: 'English', isDefault: true}];
        contentStore.templatingVariables = [];
        contentStore.textColors = [];
        contentStore.storyVariables = [];

        appStore.projectLoaded = true;
    }

    function exportLanguage(language: string): void {

    }
    

    return {
        exportProject,
        importProject,
        createProject
    }
}