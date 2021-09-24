declare const ipcRenderer: {
  invokeGetBreakEndTime: () => Promise<string | null>;
  invokeGetSettings: () => Promise<unknown>;
  invokeSetSettings: (settings: unknown) => Promise<void>;
  onPlayEndGong: (cb: () => void) => Promise<void>;
  onPlayStartGong: (cb: () => void) => Promise<void>;
};

declare const processEnv: {
  [key: string]: string;
};

declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}
