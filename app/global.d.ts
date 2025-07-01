declare const ipcRenderer: {
  invokeBreakPostpone: () => Promise<void>;
  invokeGetAllowPostpone: () => Promise<boolean>;
  invokeGetBreakLength: () => Promise<Date>;
  invokeGetSettings: () => Promise<unknown>;
  invokeGetNextBreak: () => Promise<unknown>;
  invokeEndSound: (type: string) => Promise<unknown>;
  invokeStartSound: (type: string) => Promise<unknown>;
  invokeSetSettings: (settings: unknown) => Promise<void>;
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
