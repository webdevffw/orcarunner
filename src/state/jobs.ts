import Job from "@lib/job";

export class GlobalState {
  jobs: Map<string, Job>;

  constructor() {
    this.jobs = new Map<string, Job>();
  }

  addJob = (job: Job): Map<string, Job> => this.jobs.set(job.getId(), job);
  deleteJob = (id: string): boolean => this.jobs.delete(id);

  getAll = (): Job[] => [...this.jobs.values()];
  getJob = (id: string): Job | undefined => this.jobs.get(id);
  getAllJobs = () => this.getJobs();

  private getJobs = (): Job[] => [...this.jobs.values()];
}

// ensure singleton survives HMR
const globalForState = globalThis as unknown as { globalState?: GlobalState };
export const globalState = globalForState.globalState ?? (globalForState.globalState = new GlobalState());
