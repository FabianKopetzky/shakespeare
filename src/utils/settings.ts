import type { Preferences } from "../types/schema";

const defaultSettings: Preferences = {
  unityStreamingAssetsPath: "",
  compileTextColors: false,
  warnBeforeClosing: true,
  warnBeforeDiscarding: true,
  allowEmptyDialogues: false,
  autoSaveProject: false,
  showAutoSaveMessages: false,
  showMissingTranslations: true
};

export default defaultSettings;