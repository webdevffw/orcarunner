import { GlobalState } from "@state/jobs";
import { IDetails } from "@models/interfaces";
import { Workflow, JobDetails } from "@models/types";
import Job from "@lib/job";

export class ActionController {
  protected processStructure: any;

  constructor(
    private details: IDetails,
    protected work: Workflow,
    protected state: GlobalState,
  ) {}

  activateWorker = (): JobDetails | undefined => {
    const job = new Job(this.details, this.work);

    try {
      const added = this.state.addJob(job).get(job.getId())
      return added?.getDetails();
    } catch (error) {
      console.error("Error activating worker:", error);
      throw new Error("Failed to activate worker.");
    }
  }
}
