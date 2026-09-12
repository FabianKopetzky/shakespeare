import { useContentStore } from "../stores/content";
import type { AnyStoryNode, BranchNode, CustomFields, RandomNode, StoryNode } from "../types/schema";

export function useCompiler() {
    const contentStore = useContentStore();

    function resolveColorVariables(text: string): string {
        return text.replace(/<color=([^>]+)>/g, (match, value) => {
            if (value.startsWith('#')) return match;
            const colorEntry = contentStore.textColors?.find((c) => c.name === value);
            return colorEntry ? `<color=#${colorEntry.hex.replace(/^#/, '')}>` : match;
        });
    }
    function resolveColorVariable(text: string, variable: string, color: string): string {
        const regex = new RegExp(`<color=${variable}>`, 'g');
        return text.replace(regex, () => `<color=#${color.replace(/^#/, '')}>`);
    }
    function resolveStoryVariable(text: string, variable: string, value: string | number | boolean): string {
        const regex = new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, 'g');
        return text.replace(regex, String(value));
    }
    function compileCustomFields(fields: CustomFields): any {
        if(!fields.data || fields.data.length <= 0) return null;
        const entries = fields.data.map(field => {
            const schema = contentStore.customFields.find(f => f.name === field.name);
            if(!schema) return null;
            return {
                name: field.name,
                type: schema.type,
                value: field.value
            }
        });
        return entries;
    }

    function getProjectData(): any {
        const data = {
            projectTitle: contentStore.projectTitle,
            projectAuthor: contentStore.projectAuthor,
            unityStreamingAssetsPath: contentStore.settings.unityStreamingAssetsPath,

            dialogues: contentStore.dialogues,
            stories: contentStore.stories,
            storyNodes: contentStore.storyNodes,

            colors: contentStore.textColors,
            languages: contentStore.languages,
            storyVariables: contentStore.storyVariables,
            customFields: contentStore.customFields,
            events: contentStore.events
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
            if(!story) continue;
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
                                            // replace color variables
                                            const translation = s.translations[language.code] ?? s.translations[defaultLanguage?.code] ?? '';
                                            return { 
                                                value: resolveColorVariables(translation),
                                                fields: compileCustomFields(s.fields)
                                            } 
                                        });
                                    dialogues.push({
                                        id: dialogue.id,
                                        sentences: sentences,
                                        fields: compileCustomFields(dialogue.fields)
                                    });
                                }
                                nodes.push(nodeData);
                                break;
                            case 'branch':
                                const branches = (nodeData as Partial<BranchNode>).branches?.map(b => {
                                    const translation = b.labels[language.code] ?? b.labels[defaultLanguage.code] ?? '';
                                    return {
                                        label: resolveColorVariables(translation),
                                        targetId: b.targetId,
                                        condition: b.condition,
                                        fields: compileCustomFields(b.fields)
                                    }
                                });
                                const branchNode = {
                                    ...nodeData,
                                    branches
                                };
                                nodes.push(branchNode);
                                break;
                            case 'random':
                                const randomBranches = (nodeData as Partial<RandomNode>).branches?.map(b => ({ weight: b.weight, targetId: b.targetId }));
                                const randomNode = {
                                    ...nodeData,
                                    branches: randomBranches
                                }
                                nodes.push(randomNode);
                                break;
                            default:
                                nodes.push(nodeData);
                                break;
                        }
                    }
                }

                const sample = {
                    id: story.id,
                    entry: story.entryNodeId,
                    nodes: nodes,
                    dialogues: dialogues,
                    fields: compileCustomFields(story.fields)
                };
                const idx = `${story?.id ?? ""}_${language.code ?? ""}`;
                data[idx] = sample;
            }
        }
        return data;
    }


    return {
        resolveColorVariable,
        resolveStoryVariable,
        getProjectData,
        compileStories,
        compileProjectMain
    }
}