import type { MetaData, Preferences } from "../types/schema";

export function isValidProject(project: any): project is {
    projectTitle?: string;
    projectAuthor?: string;
    settings?: Preferences;
    meta?: MetaData;
    dialogues: any[];
    stories: any[];
    storyNodes: Record<string, any>;
    colors?: any[];
    languages?: any[];
    storyVariables?: any[];
    customFields?: any[];
    events?: any[];
    computedProperties?: any[];
} {
    if (typeof project !== 'object' || project === null || Array.isArray(project)) {
        return false;
    }

    if (!Array.isArray(project.dialogues)) return false;
    if (!Array.isArray(project.stories)) return false;
    if (typeof project.storyNodes !== 'object' || project.storyNodes === null || Array.isArray(project.storyNodes)) {
        return false;
    }

    // Optional fields
    if ('projectTitle' in project && typeof project.projectTitle !== 'string') return false;
    if ('projectAuthor' in project && typeof project.projectAuthor !== 'string') return false;
    if ('colors' in project && !Array.isArray(project.colors)) return false;
    if ('languages' in project && !Array.isArray(project.languages)) return false;
    if ('storyVariables' in project && !Array.isArray(project.storyVariables)) return false;
    if ('customFields' in project && !Array.isArray(project.customFields)) return false;
    if ('events' in project && !Array.isArray(project.events)) return false;
    if ('computedProperties' in project && !Array.isArray(project.computedProperties)) return false;

    return true;
}