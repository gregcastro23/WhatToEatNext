class TS1131Processor {
  constructor() { this.projectRoot = process.cwd(); }
  async process(dryRun = true) {
    return { filesProcessed: 0, errorsFixed: 0 };
  }
  async getFilesWithErrors() { return []; }
}
export default TS1131Processor;
