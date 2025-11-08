import { GlobalState, globalState } from "../state/jobs";
import { IDetails } from "../models/interfaces";
import { Workflow, JobDetails } from "../models/types";
import Job from "../lib/job";

export const runtime = "nodejs";

export class ActionController {
  private details: IDetails;
  private workflow: Workflow;
  private state: GlobalState = globalState;

  constructor({ details, workflow }: { details: IDetails, workflow: Workflow }) {
    this.details = details;
    this.workflow = workflow;
  }

  executeWorker = (): JobDetails | undefined => {
    const job = new Job(this.details, this.workflow);

    try {
      const added = this.state.addJob(job).get(job.getId())
      added?.start();

      return added?.getDetails();
    } catch (error) {
      console.error("Error activating worker:", error);
      throw new Error("Failed to activate worker.");
    }
  }
}
