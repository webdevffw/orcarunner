import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import EventStream from "./stream";
import { createLogFile } from "../modules/logger";

const green = chalk.green;
const yellow = chalk.yellow;
const red = chalk.red;

export class LoggerModule {
  private location: string;
  private logger: pino.Logger;
  private eventStream: EventStream;
  private fileStream: fs.WriteStream;
  private logs: string[] = [];

  constructor(
    { url = '', dir = './logs/', file = 'runtime.log' }
  ) {
    let logFileCreated, logFileCreateError;
    try { logFileCreated = createLogFile({ LOG_DIR: dir, LOG_FILE: file }); }
    catch (error) { logFileCreateError = error; }

    this.location = path.join(dir, file);
    this.eventStream = new EventStream(url);
    this.fileStream = fs.createWriteStream(this.location, { flags: 'a' });
    this.logger = pino(
      {
        level: 'info',
        formatters: { level(label) { return { level: label } } },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.multistream([
        { stream: this.fileStream },
        { stream: { write: this.stdioWrite } },
        { stream: { write: (msg) => this.logs.push(msg) } },
        { stream: { write: (msg) => this.eventStream.send(msg) } },
      ]));
  }

  getLogger = () => this.logger;
  getUrl = () => this.eventStream.url;

  attachReadStream = () => this.eventStream.attach();
  ping = (message: string) => this.eventStream.ping(message);
  done = () => this.eventStream.done();
  close = () => this.eventStream.close();

  private stdioWrite = (message) => {
    const { msg, phase, status, result, error } = JSON.parse(message);

    process.stdout.write(`\n📝 ${msg}${error ? ' - ' + red(error) : result ? ' - ' + green(JSON.stringify(result)) : ''}${status ? ' (' + yellow(status) + ')\n' : ''}${ msg.includes('Orchestration') && status === 'finished' ? '\n' : ''}`);
  }
}
