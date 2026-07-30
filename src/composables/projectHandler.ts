import { useAppStore } from "../stores/app";
import { useContentStore } from "../stores/content";
import type { AnyStoryNode, DialogueNode, Story, StoryNode } from "../types/schema";

export function useProjectHandler() {
    const contentStore = useContentStore();
    const appStore = useAppStore();

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
        contentStore.templatingVariables = [];
        contentStore.textColors = [];
        contentStore.storyVariables = [];

        appStore.projectLoaded = true;
    }

    function compileProjectMain(): boolean {
        const languages = contentStore.languages.map(l => { return { code: l.code, name: l.display } });
        const variables = contentStore.storyVariables;

        const data = {
            languages: languages,
            variables: variables
        }

        const json = JSON.stringify(data);
        downloadFile(json, 'application/json', `${contentStore.projectTitle}_main.json`);
        return true;
    }

    function compileStories(): boolean {
        const defaultLanguage = contentStore.languages.find(l => l.isDefault);
        if (!defaultLanguage) return false;

        for (const story of contentStore.stories) {
            for (const language of contentStore.languages) {

                const nodes: Partial<AnyStoryNode>[] = []; // fetch all nodes that are referenced in the story
                const dialogues = []; // for all dialogue nodes, bake the sentences into the compiled story file in the corresponding language
                for (const n of story?.nodes ?? []) {
                    if (!n) continue;
                    if (story?.nodes.includes(n) && contentStore.storyNodes[n]) {
                        const { position, ...nodeData } = contentStore.storyNodes[n];
                        nodes.push(nodeData);

                        // check dialogue node
                        if (contentStore.storyNodes[n].type === 'story') {
                            const dialogue = contentStore.dialogues.find(d => d?.id === (contentStore.storyNodes[n] as StoryNode).dialogueId);
                            if (dialogue) {
                                const sentences = dialogue.sentences.map(s => { return { value: s.translations[language.code] ?? s.translations[defaultLanguage?.code] ?? '' } });
                                dialogues.push({
                                    id: dialogue.id,
                                    sentences: sentences
                                });
                            }
                        }
                    }
                }

                const data = {
                    id: story?.id,
                    entry: story?.entryNodeId,
                    nodes: nodes,
                    dialogues: dialogues
                }

                const json = JSON.stringify(data);
                downloadFile(json, 'application/json', `${story?.id}_${language.code}.json`);
            }
        }
        return true;
    }
    // function compileLanguage(languageCode: string): boolean {
    //     const language = contentStore.languages.find(l => l.code == languageCode);
    //     const defaultLanguage = contentStore.languages.find(l => l.isDefault);
    //     if (!language) return false;
    //     if (!defaultLanguage) return false;

    //     const data = {
    //         dialogues: contentStore.dialogues.map(d => {
    //             const sentences = d?.sentences.map(s => { return { value: s.translations[languageCode] ?? s.translations[defaultLanguage?.code] ?? '' }});
    //             return {
    //                 id: d?.id,
    //                 sentences: sentences
    //             }   
    //         })
    //     }

    //     const json = JSON.stringify(data);
    //     downloadFile(json, 'application/json', `${contentStore.projectTitle ?? 'project'}_dialogues_${languageCode}.json`);
    //     return true;
    // }


    return {
        exportProject,
        importProject,
        createProject,
        compileStories,
        compileProjectMain
    }
}