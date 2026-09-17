import { createLogger, logger } from "../logger";

describe("createLogger", () => {
  it("preserves metadata arguments passed to component loggers", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const log = createLogger("TestComponent");

    const metadata = { userId: "user-123", action: "test-run" };
    log.info("Operation completed successfully", metadata);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(
      "[INFO][TestComponent] Operation completed successfully",
      metadata,
    );

    infoSpy.mockRestore();
  });

  it("preserves multiple arguments passed to component loggers", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger("ErrorComponent");

    const err = new Error("Something broke");
    const meta = { retryCount: 3 };
    log.error("Failed to process", err, meta);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "[ERROR][ErrorComponent] Failed to process",
      err,
      meta,
    );

    errorSpy.mockRestore();
  });

  it("works when called directly on root logger", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("System warning", { detail: "high load" });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("[WARN] System warning", { detail: "high load" });

    warnSpy.mockRestore();
  });
});
