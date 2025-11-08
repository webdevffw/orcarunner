# Orchestrator

### Distribution
NPM Package

### Library
- Classes
- Interfaces
- Methods

### Usage
Import objects as dependencies
```
import { ActionController } from 'orcarunner';
import { IEventAction } from 'orcarunner';

const demoFn = (payload: any, action: IEventAction): Promise<void> => {
  const { args } = payload;

  return new Promise((resolve, reject) => {
    args.forEach(i => console.log(i));
    resolve();
  });
}

const demoWorkflow = (payload) => {
  return [
    {
      name: "",
      description: "",
      steps: [
        {
          name: "",
          fn: (action: IEventAction) => demoFn(payload, action)
        }
      ]
    }
  ]
}

const activity = new ActionController({
  details: {
    title: "",
    logDir: "logs",
    logFile: "test-run.log",
    createdAt: "",
    updatedAt: "",
  },
  workflow: {
    payload: { args: [ "one", "two", "three" ] },
    starter: demoWorkflow
  }
});

activity.executeWorker();
```
