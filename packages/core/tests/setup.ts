// Global test setup
import { jest } from "@jest/globals";

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NODE_ENV = "test";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.QDRANT_URL = "http://localhost:6333";
process.env.QDRANT_API_KEY = "test-qdrant-key";
