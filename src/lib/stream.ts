type ClientWriter = WritableStreamDefaultWriter<Uint8Array>;

export default class EventStream {
  encoder: TextEncoder = new TextEncoder();
  writers: Set<ClientWriter> = new Set();
  url?: string;

  constructor(url?: string) {
    this.url = url;
  }

  attach(): ReadableStream<Uint8Array> {
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) { controller.enqueue(chunk) },
    });

    const writer = writable.getWriter();
    this.writers.add(writer);

    // cleanup if client disconnects
    readable.cancel = async (reason?: any) => {
      this.writers.delete(writer);
      await writer.close();
      return Promise.resolve();
    };

    return readable;
  }

  private async broadcast(data: string) {
    const encoded = this.encoder.encode(data);

    for (const writer of [...this.writers]) {
      try {
        await writer.write(encoded);
      } catch (err: any) {
        // client went away, drop the writer
        console.warn(`❌ Error writing to stream writer: ${err.message}`);
        this.writers.delete(writer);
      }
    }
  }

  private async closeAll() {
    for (const writer of this.writers) await writer.close();
    this.writers.clear();
  }

  ping = (msg: string = "ok") => this.broadcast(`event: ping\ndata: ${msg}\n\n`);
  send = (data: string) => this.broadcast(`event: json\ndata: ${data}\n\n`);
  done = () => this.broadcast(`event: done\ndata: stream is completed\n\n`);
  close = () => this.closeAll();
  getStreamWriters = () => {
    return {
      send: this.send,
      ping: this.ping,
      done: this.done,
      close: this.close,
      stream: {
        write: (msg) => this.send(msg)
      }
    }
  }
}
