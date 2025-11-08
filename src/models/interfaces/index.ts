import pino from "pino";
import { EntityState, Validation } from "../types";

export interface Entity {
  init(): EntityState;
  validate(): Validation;
  getState(): EntityState;
  describe(): string;
}

export interface IOrchestrationLog {
  processId?: number;
  instanceId: string;
  type: 'orchestration' | 'phase' | 'step';
  status?: 'start' | 'progress' | 'end' | 'error';
  name: string;
  phases?: number;
  phaseIndex?: number;
  step?: string;
  steps?: number;
  stepIndex?: number;
  stream?: "stdout" | "stderr";
  timestamp: string;
}

export interface IEventAction {
  logger: pino.Logger;
  log: IOrchestrationLog;
}

export interface IOrchestration {
  phases: IWorkerPhase[];
  phaseIndex?: number;
  stepIndex?: number;
}

export interface IWorkerPhase {
  name: string;
  description: string;
  steps: IWorkerStep[];
}

export interface IWorkerStep {
  name: string;
  fn: (action: IEventAction) => Promise<void>;
}

export interface IDetails {
  title: string;
  description?: string;
  logDir: string;
  logFile: string;
  createdAt: string;
  updatedAt: string;
  user?: string;
}