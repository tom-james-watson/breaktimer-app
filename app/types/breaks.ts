import { Moment } from "moment";

export type BreakTime = Moment | null;

export interface ActiveBreak {
  scheduleId: string;
  title: string;
  message: string;
  lengthSeconds: number;
}
