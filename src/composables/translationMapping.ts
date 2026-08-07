import { storeToRefs } from "pinia";
import { useProjectHandler } from "./projectHandler";
import { useContentStore } from "../stores/content";

export function useTranslationMapping() {

    const { downloadFile } = useProjectHandler();
    const { languages, dialogues, storyNodes, projectTitle } = storeToRefs(useContentStore());

    function exportTranslationMap(placeholder: string, separator: string): void {

        const languageCodes = languages.value.map(l => l.code);

        const header: string = ['id', ...languageCodes].join(separator);
        const rows: string[] = [];

        for(const dialogue of dialogues.value) {
            if(!dialogue) continue;
            for(const sentence of dialogue?.sentences ?? []) {
                const id: string = `s|${dialogue.id}|${sentence.key}`;
                const row = [id, ...languageCodes.map(c => sentence.translations[c] ?? placeholder)].join(separator);
                rows.push(row);
            }
        }
        for(const node of Object.keys(storyNodes.value)) {
            if(storyNodes.value[node].type === 'branch') {
                for(const branch of storyNodes.value[node].branches) {
                    const id: string = `b|${node}|${branch.id}`;
                    const row = [id, ...languageCodes.map(c => branch.labels[c] ?? placeholder)].join(separator);
                    rows.push(row);
                }
            }
        }

        const content: string = [header, ...rows].join('\n');
        downloadFile(content, 'text/csv', `translations_${projectTitle.value}`);

    }
    function importTranslationMap(rows: string[], placeholder: string, separator: string): void {
        const languageCodes = languages.value.map(l => l.code);
        const languagesInFile = rows[0].split(separator).slice(1);

        function languageInProject(code: string): boolean {
            return languageCodes.includes(code);
        }

        for(const row of rows) {
            const items = row.split(separator);
            const key = items[0];
            const translations = items.slice(1);

            const [idType, idObject, idItem] = key.split('|');

            if(idType === 's') { // sentence
                const dialogue = dialogues.value.find(d => d?.id === idObject);
                if(!dialogue) continue;

                const sentence = dialogue.sentences.find(s => s.key === idItem);
                if(!sentence) continue;

                for(let i = 0; i < translations.length; i++) {
                    const lang = languagesInFile[i];
                    if(!languageInProject(lang)) continue;
                    const translation = translations[i];
                    if(!translation || translation === placeholder) continue;

                    sentence.translations[lang] = translation;
                }
            } else if(idType === 'b') { // branch
                const node = storyNodes.value[idObject];
                if(!node || node.type !== 'branch') continue;

                const branch = node.branches.find(b => b.id === idItem);
                if(!branch) continue;

                for(let i = 0; i < translations.length; i++) {
                    const lang = languagesInFile[i];
                    if(!languageInProject(lang)) continue;
                    const translation = translations[i];
                    if(!translation || translation === placeholder) continue;

                    branch.labels[lang] = translation;
                }
            }
        }
    }

    return {
        exportTranslationMap,
        importTranslationMap
    }
}