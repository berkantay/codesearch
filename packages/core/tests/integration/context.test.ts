import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { Context } from "../../src/context";
import { OpenAIEmbedding } from "../../src/embedding/openai-embedding";
import { QdrantVectorDatabase } from "../../src/vectordb/qdrant-vectordb";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

// Skip integration tests if Qdrant is not available
const isQdrantAvailable = async (): Promise<boolean> => {
  try {
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
    const response = await fetch(`${qdrantUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

describe("Context Integration Tests", () => {
  let context: Context;
  let tempDir: string;
  let testProjectDir: string;

  beforeEach(async () => {
    // Skip if Qdrant is not available
    if (!(await isQdrantAvailable())) {
      console.warn("Skipping integration tests - Qdrant not available");
      return;
    }

    // Create temporary directory for test project
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codesearch-test-"));
    testProjectDir = path.join(tempDir, "test-project");
    await fs.ensureDir(testProjectDir);

    // Create test files
    await createTestProject(testProjectDir);

    // Initialize context with test configuration
    const embedding = new OpenAIEmbedding({
      apiKey: process.env.OPENAI_API_KEY || "test-key",
      model: "text-embedding-3-small",
    });

    const vectorDatabase = new QdrantVectorDatabase({
      url: process.env.QDRANT_URL || "http://localhost:6333",
      apiKey: process.env.QDRANT_API_KEY,
    });

    context = new Context({
      embedding,
      vectorDatabase,
      ignorePatterns: ["node_modules/**", "*.log"],
    });
  });

  afterEach(async () => {
    // Cleanup
    if (tempDir && (await fs.pathExists(tempDir))) {
      await fs.remove(tempDir);
    }

    // Clear any test collections
    if (context && testProjectDir) {
      try {
        await context.clearIndex(testProjectDir);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  test("should index a codebase successfully", async () => {
    if (!(await isQdrantAvailable())) {
      console.warn("Skipping test - Qdrant not available");
      return;
    }

    const stats = await context.indexCodebase(testProjectDir, (progress) => {
      expect(progress).toHaveProperty("phase");
      expect(progress).toHaveProperty("percentage");
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    expect(stats).toHaveProperty("indexedFiles");
    expect(stats).toHaveProperty("totalChunks");
    expect(stats).toHaveProperty("skippedFiles");
    expect(stats.indexedFiles).toBeGreaterThan(0);
    expect(stats.totalChunks).toBeGreaterThan(0);
  });

  test("should perform semantic search", async () => {
    if (!(await isQdrantAvailable())) {
      console.warn("Skipping test - Qdrant not available");
      return;
    }

    // First index the codebase
    await context.indexCodebase(testProjectDir);

    // Perform semantic search
    const results = await context.semanticSearch(
      testProjectDir,
      "user authentication function",
      3
    );

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeLessThanOrEqual(3);

    results.forEach((result) => {
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("relativePath");
      expect(result).toHaveProperty("startLine");
      expect(result).toHaveProperty("endLine");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("score");
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });

  test("should check if index exists", async () => {
    if (!(await isQdrantAvailable())) {
      console.warn("Skipping test - Qdrant not available");
      return;
    }

    // Initially should not have index
    const hasIndexBefore = await context.hasIndex(testProjectDir);
    expect(hasIndexBefore).toBe(false);

    // After indexing should have index
    await context.indexCodebase(testProjectDir);
    const hasIndexAfter = await context.hasIndex(testProjectDir);
    expect(hasIndexAfter).toBe(true);
  });

  test("should clear index successfully", async () => {
    if (!(await isQdrantAvailable())) {
      console.warn("Skipping test - Qdrant not available");
      return;
    }

    // Index the codebase
    await context.indexCodebase(testProjectDir);
    expect(await context.hasIndex(testProjectDir)).toBe(true);

    // Clear the index
    await context.clearIndex(testProjectDir);
    expect(await context.hasIndex(testProjectDir)).toBe(false);
  });
});

async function createTestProject(projectDir: string): Promise<void> {
  // Create a simple test project structure
  const files = {
    "src/auth.ts": `
export interface User {
  id: string;
  email: string;
  name: string;
}

export class AuthService {
  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Mock authentication logic
    if (email && password) {
      return {
        id: '1',
        email,
        name: 'Test User'
      };
    }
    return null;
  }

  async validateToken(token: string): Promise<boolean> {
    // Mock token validation
    return token.length > 0;
  }
}
    `,
    "src/database.ts": `
export class DatabaseConnection {
  private connection: any;

  async connect(): Promise<void> {
    // Mock database connection
    this.connection = { connected: true };
  }

  async query(sql: string): Promise<any[]> {
    // Mock database query
    return [];
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }
}
    `,
    "src/utils.ts": `
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
    `,
    "README.md": `
# Test Project

This is a test project for CodeSearch integration tests.

## Features

- User authentication
- Database operations
- Utility functions
    `,
    "package.json": JSON.stringify(
      {
        name: "test-project",
        version: "1.0.0",
        description: "Test project for CodeSearch",
        main: "src/index.ts",
        dependencies: {},
      },
      null,
      2
    ),
  };

  // Write all test files
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectDir, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content.trim());
  }
}
