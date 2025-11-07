/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateId } from "@utils/cryptographer";
import { LoggerModule } from "./logger";
import { globalState } from "../state/jobs";
import { Runner } from "./runner";
import { JobDetails, Workflow, Status } from "@models/types";
import { IDetails } from "@models/interfaces";

export default class Job {
  private logger: LoggerModule;
  private runner: Runner;
  private details: JobDetails;

  constructor(
    details: IDetails,
    private worker: Workflow,
  ) {
    const id = generateId();
    const action = { details };
    const key = `${details.title}/${ action ? action + "/" : "" }${id}`;
    const name = `${details.title}-${ action ? action + "-" : "" }${id}`;

    this.details = { id, key, name, ...details, status: "pending" };
    this.logger = new LoggerModule({ dir: details.logDir, file: details.logFile });
    this.runner = new Runner(id, name, this.logger.getLogger());
  }

  attachStream = () => this.logger.attachReadStream();
  orchestrationsStarted = () => this.details.status !== "pending";
  getStatus = () => this.details.status;

  getId = () => this.details.id;
  getDetails = <T extends JobDetails>() => this.details as T;
  setDetails = <T extends JobDetails>(details: T) => this.details = details;
  updateDetails = <T extends JobDetails>(details: T) => this.details = { ...this.details, ...details };
  updateStatus = (status: Status) => this.details.status = status;
  getStreamingUrl = () => this.logger.getUrl();

  start = async () => {
    if (this.orchestrationsStarted()) return;
    const { starter, payload, stepIndex = 0, phaseIndex = 0 } = this.worker;

    try {
      // send initial connect messages (use await to ensure they flush)
      await this.logger.ping("\n\nRunning job...");
      await this.logger.ping("try: 10000");
      await this.logger.ping("SSE connection has been established");

      await this.runner.run(starter(payload), phaseIndex, stepIndex);

      this.details.status = "running";
      this.details.updatedAt = new Date().toISOString();

      await this.logger.ping('--- Orchestration Complete ---');
    } catch (err: any) {
      await this.logger.ping(`Error: ${err?.message ?? String(err)}`);

      this.details.status = "error";
    } finally {
      this.details.updatedAt = new Date().toISOString();
      this.details.status = this.details.status === "error" ? "error" : "done";

      await this.logger.ping('Closing connection');
      await this.logger.done();
      await this.logger.close();

      globalState.deleteJob(this.details.id);
    }
  };
}
