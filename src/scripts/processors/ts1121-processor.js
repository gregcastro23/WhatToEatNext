class TS1121Processor {
  constructor() {
    this.projectRoot = process.cwd();
  }
  async process(dryRun = true) {
    return { filesProcessed: 0, errorsFixed: 0 };
  }
  async getFilesWithErrors() {
    return [];
  }
}
export default TS1121Processor;
