import { useAppStore } from "../stores/app";
import { useContentStore } from "../stores/content";
import type { AnyStoryNode } from "../types/schema";

export function useProjectHandler() {
    const contentStore = useContentStore();
    const appStore = useAppStore();

    function downloadFile(content: string, type: 'application/json', fileName: string): void {
        const blob = new Blob([content], { type: type});
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

    function compileStories(): boolean {
        const data = {
            stories: contentStore.stories.map(s => {
                const nodes: Partial<AnyStoryNode>[] = [];
                for(const n of s?.nodes ?? []) {
                    if(!n) continue;
                    if(s?.nodes.includes(n)) {
                        const { position, ...nodeData } = contentStore.storyNodes[n];
                        nodes.push(nodeData);
                    }
                }
                return {
                    id: s?.id,
                    entry: s?.entryNodeId ?? nodes[0],
                    nodes: nodes,
                };
            })
        }   

        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', `${contentStore.projectTitle}_main.json`)
        return true;
    }
    function compileLanguage(languageCode: string): boolean {
        const language = contentStore.languages.find(l => l.code == languageCode);
        const defaultLanguage = contentStore.languages.find(l => l.isDefault);
        if (!language) return false;
        if (!defaultLanguage) return false;

        const data = {
            dialogues: contentStore.dialogues.map(d => {
                const sentences = d?.sentences.map(s => { return { value: s.translations[languageCode] ?? s.translations[defaultLanguage?.code] ?? '' }});
                return {
                    id: d?.id,
                    sentences: sentences
                }   
            })
        }

        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', `${contentStore.projectTitle ?? 'project'}_dialogues_${languageCode}.json`);
        return true;
    }


    return {
        exportProject,
        importProject,
        createProject,
        compileStories,
        compileLanguage
    }
}