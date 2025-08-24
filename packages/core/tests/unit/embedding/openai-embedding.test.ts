import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { OpenAIEmbedding } from "../../../src/embedding/openai-embedding";

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn(),
    },
  })),
}));

describe("OpenAIEmbedding", () => {
  let embedding: OpenAIEmbedding;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock
    const { OpenAI } = require("openai");
    mockOpenAI = new OpenAI();

    embedding = new OpenAIEmbedding({
      apiKey: "test-key",
      model: "text-embedding-3-small",
    });
  });

  describe("constructor", () => {
    test("should create instance with valid config", () => {
      expect(embedding).toBeInstanceOf(OpenAIEmbedding);
    });

    test("should throw error with invalid config", () => {
      expect(() => {
        new OpenAIEmbedding({
          apiKey: "",
          model: "text-embedding-3-small",
        });
      }).toThrow();
    });
  });

  describe("embed", () => {
    test("should return embedding vector for text", async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const result = await embedding.embed("test text");

      expect(result).toEqual(mockEmbedding);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "test text",
      });
    });

    test("should handle API errors gracefully", async () => {
      mockOpenAI.embeddings.create.mockRejectedValue(new Error("API Error"));

      await expect(embedding.embed("test text")).rejects.toThrow("API Error");
    });
  });

  describe("embedBatch", () => {
    test("should return embedding vectors for multiple texts", async () => {
      const mockEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ];

      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [
          { embedding: mockEmbeddings[0] },
          { embedding: mockEmbeddings[1] },
        ],
      });

      const result = await embedding.embedBatch(["text1", "text2"]);

      expect(result).toEqual(mockEmbeddings);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: ["text1", "text2"],
      });
    });

    test("should handle empty input", async () => {
      const result = await embedding.embedBatch([]);
      expect(result).toEqual([]);
      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
    });
  });

  describe("getDimensions", () => {
    test("should return correct dimensions for text-embedding-3-small", () => {
      const embedding = new OpenAIEmbedding({
        apiKey: "test-key",
        model: "text-embedding-3-small",
      });

      expect(embedding.getDimensions()).toBe(1536);
    });

    test("should return correct dimensions for text-embedding-3-large", () => {
      const embedding = new OpenAIEmbedding({
        apiKey: "test-key",
        model: "text-embedding-3-large",
      });

      expect(embedding.getDimensions()).toBe(3072);
    });
  });
});
