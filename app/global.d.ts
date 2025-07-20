declare const ipcRenderer: {
  invokeBreakPostpone: (action?: string) => Promise<void>;
  invokeGetAllowPostpone: () => Promise<boolean>;
  invokeGetBreakLength: () => Promise<number>;
  invokeGetSettings: () => Promise<unknown>;
  invokeEndSound: (type: string) => Promise<unknown>;
  invokeStartSound: (type: string) => Promise<unknown>;
  invokeSetSettings: (settings: unknown) => Promise<void>;
  invokeGetTimeSinceLastBreak: () => Promise<number | null>;
  invokeCompleteBreakTracking: (breakDurationMs: number) => Promise<void>;
  onPlayEndSound: (cb: (type: string) => void) => Promise<void>;
  onPlayStartSound: (cb: (type: string) => void) => Promise<void>;
};

declare const processEnv: {
  [key: string]: string;
};

declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}
