import { describe, it, expect, beforeEach } from "vitest";
import { logger } from "./logger";

describe("Logger System", () => {
  beforeEach(() => {
    logger.clearLogs();
  });

  it("should log debug messages", () => {
    logger.debug("test-module", "Debug message", { key: "value" });
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: "debug",
      module: "test-module",
      message: "Debug message",
    });
  });

  it("should log info messages", () => {
    logger.info("test-module", "Info message");
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.level).toBe("info");
  });

  it("should log warn messages", () => {
    logger.warn("test-module", "Warn message");
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.level).toBe("warn");
  });

  it("should log error messages with error object", () => {
    const error = new Error("Test error");
    logger.error("test-module", "Error message", { context: "test" }, error);
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      level: "error",
      module: "test-module",
      message: "Error message",
      error: "Test error",
    });
  });

  it("should filter logs by level", () => {
    logger.debug("module1", "Debug");
    logger.info("module1", "Info");
    logger.warn("module1", "Warn");
    logger.error("module1", "Error");

    const infoLogs = logger.getLogs({ level: "info" });
    expect(infoLogs).toHaveLength(1);
    expect(infoLogs[0]?.level).toBe("info");

    const errorLogs = logger.getLogs({ level: "error" });
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0]?.level).toBe("error");
  });

  it("should filter logs by module", () => {
    logger.info("module1", "Message 1");
    logger.info("module2", "Message 2");
    logger.info("module1", "Message 3");

    const module1Logs = logger.getLogs({ module: "module1" });
    expect(module1Logs).toHaveLength(2);
    expect(module1Logs.every((log) => log.module === "module1")).toBe(true);
  });

  it("should limit logs returned", () => {
    for (let i = 0; i < 10; i++) {
      logger.info("module", `Message ${i}`);
    }

    const limitedLogs = logger.getLogs({ limit: 5 });
    expect(limitedLogs).toHaveLength(5);
  });

  it("should get statistics", () => {
    logger.debug("module", "Debug");
    logger.debug("module", "Debug 2");
    logger.info("module", "Info");
    logger.warn("module", "Warn");
    logger.error("module", "Error");

    const stats = logger.getStats();
    expect(stats).toMatchObject({
      total: 5,
      debug: 2,
      info: 1,
      warn: 1,
      error: 1,
    });
  });

  it("should clear all logs", () => {
    logger.info("module", "Message 1");
    logger.info("module", "Message 2");

    expect(logger.getLogs()).toHaveLength(2);

    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });

  it("should maintain max logs limit", () => {
    // 创建一个新的logger实例来测试max logs
    const testLogger = require("./logger").logger;
    testLogger.clearLogs();

    // 添加超过最大日志数的日志
    for (let i = 0; i < 1100; i++) {
      testLogger.info("module", `Message ${i}`);
    }

    const logs = testLogger.getLogs();
    expect(logs.length).toBeLessThanOrEqual(1000);
  });

  it("should include timestamp in logs", () => {
    const beforeTime = new Date().toISOString();
    logger.info("module", "Message");
    const afterTime = new Date().toISOString();

    const logs = logger.getLogs();
    expect(logs[0]?.timestamp).toBeDefined();
    expect(logs[0]?.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(logs[0]?.timestamp).toBeLessThanOrEqual(afterTime);
  });
});
