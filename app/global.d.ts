declare const ipcRenderer: {
  invokeBreakPostpone: () => Promise<void>;
  invokeGetAllowPostpone: () => Promise<boolean>;
  invokeGetBreakLength: () => Promise<Date>;
  invokeGetSettings: () => Promise<unknown>;
  invokeEndSound: (type: string, volume: number) => Promise<unknown>; // Updated to include volume
  invokeStartSound: (type: string, volume: number) => Promise<unknown>; // Updated to include volume
  invokeSetSettings: (settings: unknown) => Promise<void>;
  onPlayEndSound: (cb: (type: string, volume: number) => void) => Promise<void>; // Updated to include volume
  onPlayStartSound: (cb: (type: string, volume: number) => void) => Promise<void>; // Updated to include volume
};

declare const processEnv: {
  [key: string]: string;
};

declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}
