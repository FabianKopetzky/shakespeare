import type { Preferences } from "../types/schema";

const defaultSettings: Preferences = {
  unityStreamingAssetsPath: "",
  compileTextColors: false,
  warnBeforeClosing: true,
  warnBeforeDiscarding: true,
  autoSaveProject: false,
  showAutoSaveMessages: false,
  showMissingTranslations: true,
  storyGraphPattern: 'lines',
  storyGraphPatternSize: 4,
  storyGraphPatternGap: 80,
};

export default defaultSettings;