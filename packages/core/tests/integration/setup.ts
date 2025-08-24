// Integration test setup
import { beforeAll, afterAll } from "@jest/globals";

beforeAll(async () => {
  // Setup for integration tests
  console.log("Setting up integration tests...");

  // Check if required services are available
  const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";

  try {
    // Test Qdrant connection
    const response = await fetch(`${qdrantUrl}/health`);
    if (!response.ok) {
      console.warn(
        "Qdrant is not available, some integration tests may be skipped"
      );
    }
  } catch (error) {
    console.warn(
      "Qdrant is not available, some integration tests may be skipped"
    );
  }
});

afterAll(async () => {
  // Cleanup after integration tests
  console.log("Cleaning up integration tests...");
});
