declare const ipcRenderer: {
  invokeBreakPostpone: (action?: string) => Promise<void>;
  invokeGetAllowPostpone: () => Promise<boolean>;
  invokeGetBreakLength: () => Promise<number>;
  invokeGetSettings: () => Promise<unknown>;
  invokeEndSound: (type: string, volume?: number) => Promise<unknown>;
  invokeStartSound: (type: string, volume?: number) => Promise<unknown>;
  invokeSetSettings: (settings: unknown) => Promise<void>;
  invokeGetTimeSinceLastBreak: () => Promise<number | null>;
  invokeCompleteBreakTracking: (breakDurationMs: number) => Promise<void>;
  onPlayEndSound: (cb: (type: string, volume?: number) => void) => Promise<void>;
  onPlayStartSound: (cb: (type: string, volume?: number) => void) => Promise<void>;
};

declare const processEnv: {
  [key: string]: string;
};

declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}
