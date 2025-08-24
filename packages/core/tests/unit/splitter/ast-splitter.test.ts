import { describe, test, expect, beforeEach } from "@jest/globals";
import { ASTSplitter } from "../../../src/splitter/ast-splitter";
import { CodeChunk } from "../../../src/types";

describe("ASTSplitter", () => {
  let splitter: ASTSplitter;

  beforeEach(() => {
    splitter = new ASTSplitter({
      maxChunkSize: 1000,
      chunkOverlap: 100,
    });
  });

  describe("constructor", () => {
    test("should create instance with default config", () => {
      const defaultSplitter = new ASTSplitter();
      expect(defaultSplitter).toBeInstanceOf(ASTSplitter);
    });

    test("should create instance with custom config", () => {
      expect(splitter).toBeInstanceOf(ASTSplitter);
    });
  });

  describe("split", () => {
    test("should split TypeScript code into chunks", async () => {
      const code = `
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

class User {
  constructor(private name: string) {}
  
  getName(): string {
    return this.name;
  }
}

export { greet, User };
      `.trim();

      const chunks = await splitter.split(code, "test.ts");

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);

      chunks.forEach((chunk: CodeChunk) => {
        expect(chunk).toHaveProperty("content");
        expect(chunk).toHaveProperty("startLine");
        expect(chunk).toHaveProperty("endLine");
        expect(chunk).toHaveProperty("language");
        expect(chunk.language).toBe("typescript");
        expect(chunk.content.length).toBeLessThanOrEqual(1000);
      });
    });

    test("should split JavaScript code into chunks", async () => {
      const code = `
function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b;

module.exports = { add, multiply };
      `.trim();

      const chunks = await splitter.split(code, "test.js");

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);

      chunks.forEach((chunk: CodeChunk) => {
        expect(chunk.language).toBe("javascript");
      });
    });

    test("should split Python code into chunks", async () => {
      const code = `
def greet(name: str) -> str:
    return f"Hello, {name}!"

class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b
    
    def multiply(self, a: int, b: int) -> int:
        return a * b

if __name__ == "__main__":
    calc = Calculator()
    print(calc.add(2, 3))
      `.trim();

      const chunks = await splitter.split(code, "test.py");

      expect(chunks).toBeInstanceOf(Array);
      expect(chunks.length).toBeGreaterThan(0);

      chunks.forEach((chunk: CodeChunk) => {
        expect(chunk.language).toBe("python");
      });
    });

    test("should handle empty code", async () => {
      const chunks = await splitter.split("", "test.ts");
      expect(chunks).toEqual([]);
    });

    test("should handle unsupported file extension", async () => {
      const code = "Some random text content";
      const chunks = await splitter.split(code, "test.txt");

      // Should fallback to character-based splitting
      expect(chunks).toBeInstanceOf(Array);
      if (chunks.length > 0) {
        expect(chunks[0].language).toBe("text");
      }
    });

    test("should respect maxChunkSize", async () => {
      const longCode = "const x = 1;\n".repeat(100); // Create long code
      const chunks = await splitter.split(longCode, "test.js");

      chunks.forEach((chunk: CodeChunk) => {
        expect(chunk.content.length).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe("language detection", () => {
    test("should detect TypeScript from .ts extension", () => {
      expect(splitter["getLanguageFromExtension"](".ts")).toBe("typescript");
    });

    test("should detect JavaScript from .js extension", () => {
      expect(splitter["getLanguageFromExtension"](".js")).toBe("javascript");
    });

    test("should detect Python from .py extension", () => {
      expect(splitter["getLanguageFromExtension"](".py")).toBe("python");
    });

    test("should return text for unknown extension", () => {
      expect(splitter["getLanguageFromExtension"](".unknown")).toBe("text");
    });
  });
});
