declare const ipcRenderer: {
  invokeGetBreakEndTime: () => Promise<string | null>;
  invokeGetSettings: () => Promise<object>;
  invokeSetSettings: (settings: object) => Promise<void>;
  onPlayEndGong: (cb: () => void) => Promise<void>;
  onPlayStartGong: (cb: () => void) => Promise<void>;
};

declare const processEnv: {
  [key: string]: string;
};
