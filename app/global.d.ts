declare const ipcRenderer: {
  invokeGetBreakLength: () => Promise<Date>;
  invokeGetSettings: () => Promise<unknown>;
  invokeGongEndPlay: () => Promise<unknown>;
  invokeGongStartPlay: () => Promise<unknown>;
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
