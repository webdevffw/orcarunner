/* eslint-disable @typescript-eslint/no-explicit-any */
import { IWorkerPhase } from "../interfaces";

export type Status = "pending" | "running" | "done" | "error";
export type StateCode = "ok" | "creating" | "missing" | "error";
export type Feature = "application" | "brand" | "domain" | "config";

export type FeatureState = { jobs: JobRecord; feature: Feature; fileStructure: EntityState; }
export type EntityState = Record<string, StateCode>;
export type Structure = { [location: string]: "file" | "dir"; };
export type WorkerStructure = { [location: string]: FSWorkers; };
export type WorkerSet = Map<string, Workflow>;
export type Collection = Map<string, any>;
export type FSWorkers = { type: "file" | "dir"; create: Workflow; validate: Workflow; remove: Workflow; }
export type Validation = { [key: string]: boolean };
export type ValidationResult = { code: StateCode; message: string; details: Validation };
export type LogDetails = { LOG_DIR: string; LOG_FILE: string; }

export type FileSystemAction = {
  status: StateCode;
  message: string;
  fileStructure: EntityState;
};

export type StreamPair = {
  readable: ReadableStream<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>;
};

export type Workflow = {
  payload: any;
  phaseIndex?: number;
  stepIndex?: number;
  starter: (payload: any) => IWorkerPhase[];
};

export type JobRecord = Record<string, JobDetails[]>;
export type JobDetails = {
  id: string;
  key: string;
  url?: string;
  target?: string;
  name: string;
  logDir?: string;
  logFile?: string;
  status?: StateCode;
  user?: string;
  email?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};
