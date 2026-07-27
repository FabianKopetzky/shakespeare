import { useContentStore } from "../stores/content";

export function useProjectHandler() {
    const contentStore = useContentStore();

    function exportProject(): void {
        const data = {
            projectTitle: contentStore.projectTitle,
            projectAuthor: contentStore.projectAuthor,

            dialogues: contentStore.dialogues,
            stories: contentStore.stories,

            colors: contentStore.textColors,
            templating: contentStore.templatingVariables,
            languages: contentStore.languages
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
            contentStore.projectTitle = project.projectTitle;
            contentStore.projectAuthor = project.projectAuthor;

            contentStore.dialogues = project.dialogues;
            contentStore.stories = project.stories;
            
            contentStore.textColors = project.colors;
            contentStore.templatingVariables = project.templating;
            contentStore.languages = project.languages;

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
        
        contentStore.languages = [{code: 'default', display: 'English', isDefault: true}];
        contentStore.templatingVariables = [];
        contentStore.textColors = [];
    }

    return {
        exportProject,
        importProject,
        createProject
    }
}