import { Moment } from "moment";

export const NOW_KEY = Symbol("Now");
export type Breaks = Record<string, Moment> & { [NOW_KEY]?: Moment };
