import pino from "pino";
import { IOrchestrationLog } from "../models/interfaces";
import { IWorkerPhase } from "../models/interfaces";

export class Runner {
  constructor(private instanceId: string, private name: string, private logger: pino.Logger) {}

  logInfo = (message?: string, meta?: Record<string, any>) => this.logger.info({ instanceId: this.instanceId, ...meta }, message);
  logError = (message?: string, meta?: Record<string, any>) => this.logger.error({ instanceId: this.instanceId, ...meta }, message);

  run = async (phases: IWorkerPhase[], phaseIndex?: number, stepIndex?: number) => {
    const processId = process.pid;
    const orchestrationInfo = { ...this.getOrchestrationLog(phases.length), processId };

    this.logInfo("Orchestration Starting", { ...orchestrationInfo, status: 'start' });

    await this.runOrchestration({ phases, index: stepIndex, phaseIndex, processId });

    this.logInfo("Orchestration finished", { ...orchestrationInfo, status: 'end' });
  }

  private runOrchestration = async ({ phases, index = 0, phaseIndex, processId }) => {
    for (let i = phaseIndex; i < phases.length; i++) {
      const phase = phases[i];
      const steps = phase.steps || [];
      const phaseInfo = { ...this.getPhaseLog(phase.name, i), processId };

      this.logInfo(`Starting phase: ${phaseInfo.name}`, { ...phaseInfo, status: "start" });

      await this.runPhase({ steps, index, phaseIndex: i, processId });

      this.logInfo(`Phase finished: ${phaseInfo.name}`, { ...phaseInfo, status: "end" });
    }
  }

  private runPhase = async ({ steps, index = 0, phaseIndex = 0, processId }) => {
    for (let i = index; i < steps.length; i++) {
      const step = steps[i];
      const stepInfo = { ...this.getStepLog(step.name, phaseIndex, i), processId };

      await step.fn({ logger: this.logger, log: stepInfo })
        .then(() => console.log(`Completed step: ${stepInfo.name}`, { ...stepInfo, status: "end" }))
        .catch(err => console.error(`Error in step: ${stepInfo.name}`, { ...stepInfo, status: "error", error: err }));
    }
  }

  private getOrchestrationLog(length: number): IOrchestrationLog {
    return {
      name: this.name,
      instanceId: this.instanceId,
      phases: length,
      type: 'orchestration',
      timestamp: new Date().toISOString()
    };
  }

  private getPhaseLog(name, length, index: number = 0): IOrchestrationLog {
    return {
      name,
      instanceId: this.instanceId,
      phaseIndex: index,
      steps: length,
      type: 'phase',
      timestamp: new Date().toISOString()
    };
  }

  private getStepLog(name: string, phaseIndex: number, index: number = 0): IOrchestrationLog {
    return {
      name,
      instanceId: this.instanceId,
      stepIndex: index,
      phaseIndex,
      type: 'step',
      timestamp: new Date().toISOString()
    };
  }
}
