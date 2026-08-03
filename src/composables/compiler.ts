import { useContentStore } from "../stores/content";
import type { AnyStoryNode, BranchNode, StoryNode } from "../types/schema";

export function useCompiler() {
    const contentStore = useContentStore();

    function getProjectData(): any {
        const data = {
            projectTitle: contentStore.projectTitle,
            projectAuthor: contentStore.projectAuthor,
            unityStreamingAssetsPath: contentStore.unityStreamingAssetsPath,

            dialogues: contentStore.dialogues,
            stories: contentStore.stories,
            storyNodes: contentStore.storyNodes,

            colors: contentStore.textColors,
            languages: contentStore.languages,
            storyVariables: contentStore.storyVariables
        }

        return data;
    }

    function compileProjectMain(): any {
        const languages = contentStore.languages.map(l => { return { code: l.code, name: l.display } });
        const variables = contentStore.storyVariables;

        const data = {
            languages: languages,
            variables: variables
        }

        return data;
    }

    function compileStories(): any {
        const data: any = {};
        const defaultLanguage = contentStore.languages.find(l => l.isDefault);
        if (!defaultLanguage) return [];

        for (const story of contentStore.stories) {
            for (const language of contentStore.languages) {

                const nodes: Partial<AnyStoryNode | any>[] = []; // fetch all nodes that are referenced in the story
                const dialogues = []; // for all dialogue nodes, bake the sentences into the compiled story file in the corresponding language
                for (const n of story?.nodes ?? []) {
                    if (!n) continue;
                    if (story?.nodes.includes(n) && contentStore.storyNodes[n]) {
                        const { position, ...nodeData } = contentStore.storyNodes[n];
                        
                        switch(contentStore.storyNodes[n].type) {
                            case 'story':
                                const dialogue = contentStore.dialogues.find(d => d?.id === (contentStore.storyNodes[n] as StoryNode).dialogueId);
                                if (dialogue) {
                                    const sentences = dialogue.sentences.map(s => 
                                        { 
                                            return { 
                                                value: s.translations[language.code] ?? s.translations[defaultLanguage?.code] ?? '' 
                                            } 
                                        });
                                    dialogues.push({
                                        id: dialogue.id,
                                        sentences: sentences
                                    });
                                }
                                nodes.push(nodeData);
                                break;
                            case 'branch':
                                const branches = (nodeData as Partial<BranchNode>).branches?.map(b => {
                                    return {
                                        label: b.labels[language.code] ?? b.labels[defaultLanguage.code] ?? '',
                                        targetId: b.targetId,
                                        condition: b.condition
                                    }
                                });
                                const branchNode = {
                                    ...nodeData,
                                    branches
                                };
                                nodes.push(branchNode);
                                break;
                            default:
                                nodes.push(nodeData);
                                break;
                        }
                    }
                }

                const sample = {
                    id: story?.id,
                    entry: story?.entryNodeId,
                    nodes: nodes,
                    dialogues: dialogues
                };
                const idx = `${story?.id ?? ""}_${language.code ?? ""}`;
                data[idx] = sample;
            }
        }
        return data;
    }


    return {
        getProjectData,
        compileStories,
        compileProjectMain
    }
}