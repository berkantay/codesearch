import { QdrantClient } from "@qdrant/js-client-rest";
import * as crypto from "crypto";
import {
  VectorDocument,
  SearchOptions,
  VectorSearchResult,
  VectorDatabase,
  HybridSearchRequest,
  HybridSearchOptions,
  HybridSearchResult,
} from "./types";

export interface QdrantConfig {
  url?: string;
  apiKey?: string;
  host?: string;
  port?: number;
  https?: boolean;
  prefix?: string;
}

/**
 * Wrapper function to handle collection creation with limit detection
 */
async function createCollectionWithLimitCheck(
  client: QdrantClient,
  collectionName: string,
  vectors: any
): Promise<void> {
  try {
    await client.createCollection(collectionName, vectors);
  } catch (error: any) {
    // Check if the error message contains the collection limit exceeded pattern
    const errorMessage = error.message || error.toString() || "";
    if (/limit.*collection|collection.*limit/i.test(errorMessage)) {
      // Throw a similar message adapted for Qdrant
      throw "[Error]: Your Qdrant account has hit its collection limit. To continue creating collections, please upgrade your plan or delete existing collections.";
    }
    // Re-throw other errors as-is
    throw error;
  }
}

export class QdrantVectorDatabase implements VectorDatabase {
  protected config: QdrantConfig;
  private client: QdrantClient | null = null;
  protected initializationPromise: Promise<void>;

  constructor(config: QdrantConfig) {
    this.config = config;

    // Start initialization asynchronously without waiting
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    // Build Qdrant client configuration
    const clientConfig: any = {};

    if (this.config.url) {
      clientConfig.url = this.config.url;
    } else if (this.config.host) {
      clientConfig.host = this.config.host;
      clientConfig.port = this.config.port || 6333;
      clientConfig.https = this.config.https ?? true;
    } else {
      // Default to localhost
      clientConfig.host = "localhost";
      clientConfig.port = 6333;
      clientConfig.https = false;
    }

    if (this.config.apiKey) {
      clientConfig.apiKey = this.config.apiKey;
    }

    if (this.config.prefix) {
      clientConfig.prefix = this.config.prefix;
    }

    console.log(
      "🔌 Connecting to Qdrant at:",
      clientConfig.url ||
        `${clientConfig.https ? "https" : "http"}://${clientConfig.host}:${
          clientConfig.port
        }`
    );

    this.client = new QdrantClient(clientConfig);
  }

  /**
   * Ensure initialization is complete before method execution
   */
  protected async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
    if (!this.client) {
      throw new Error("Client not initialized");
    }
  }

  async createCollection(
    collectionName: string,
    dimension: number,
    _description?: string
  ): Promise<void> {
    await this.ensureInitialized();

    console.log("Beginning collection creation:", collectionName);
    console.log("Collection dimension:", dimension);

    // Check if collection already exists
    const collections = await this.client!.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (exists) {
      console.log(
        `Collection '${collectionName}' already exists, skipping creation`
      );
      return;
    }

    const vectorsConfig = {
      size: dimension,
      distance: "Cosine" as const,
    };

    await createCollectionWithLimitCheck(this.client!, collectionName, {
      vectors: vectorsConfig,
    });

    console.log(`✅ Collection '${collectionName}' created successfully`);
  }

  async dropCollection(collectionName: string): Promise<void> {
    await this.ensureInitialized();

    await this.client!.deleteCollection(collectionName);
    console.log(`✅ Collection '${collectionName}' dropped successfully`);
  }

  async hasCollection(collectionName: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const collections = await this.client!.getCollections();
      return collections.collections.some((c) => c.name === collectionName);
    } catch (error) {
      console.error(
        `❌ Failed to check collection '${collectionName}' existence:`,
        error
      );
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    await this.ensureInitialized();

    const collections = await this.client!.getCollections();
    return collections.collections.map((c) => c.name);
  }

  async insert(
    collectionName: string,
    documents: VectorDocument[]
  ): Promise<void> {
    await this.ensureInitialized();

    console.log(
      `Inserting ${documents.length} documents into collection:`,
      collectionName
    );

    // Transform documents to Qdrant point format
    const points = documents.map((doc) => ({
      id: doc.id,
      vector: doc.vector,
      payload: {
        content: doc.content,
        relativePath: doc.relativePath,
        startLine: doc.startLine,
        endLine: doc.endLine,
        fileExtension: doc.fileExtension,
        metadata: doc.metadata,
      },
    }));

    // Batch insert with proper error handling
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.client!.upsert(collectionName, {
        points: batch,
        wait: true,
      });
    }

    console.log(`✅ Successfully inserted ${documents.length} documents`);
  }

  async search(
    collectionName: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<VectorSearchResult[]> {
    await this.ensureInitialized();

    const searchParams: any = {
      vector: queryVector,
      limit: options?.topK || 10,
      with_payload: true,
      with_vector: false,
    };

    // Apply filter if provided
    if (options?.filterExpr) {
      // Convert filter expressions to Qdrant filter format
      // Example: fileExtension in [".ts", ".py"] -> { should: [{ key: "fileExtension", match: { value: ".ts" }}, { key: "fileExtension", match: { value: ".py" }}] }
      const filter = this.convertFilterExpression(options.filterExpr);
      if (filter) {
        searchParams.filter = filter;
      }
    }

    const searchResult = await this.client!.search(
      collectionName,
      searchParams
    );

    return searchResult.map((result: any) => ({
      document: {
        id: result.id,
        vector: queryVector,
        content: result.payload.content,
        relativePath: result.payload.relativePath,
        startLine: result.payload.startLine,
        endLine: result.payload.endLine,
        fileExtension: result.payload.fileExtension,
        metadata: result.payload.metadata || {},
      },
      score: result.score,
    }));
  }

  async delete(collectionName: string, ids: string[]): Promise<void> {
    await this.ensureInitialized();

    await this.client!.delete(collectionName, {
      points: ids,
      wait: true,
    });

    console.log(
      `✅ Successfully deleted ${ids.length} documents from collection '${collectionName}'`
    );
  }

  async query(
    collectionName: string,
    filter: string,
    outputFields: string[],
    limit?: number
  ): Promise<Record<string, any>[]> {
    await this.ensureInitialized();

    try {
      // Convert filter expression to Qdrant format
      const qdrantFilter = this.convertFilterExpression(filter);

      // Qdrant doesn't have a direct query API like some other vector databases
      // We'll use scroll API to retrieve documents matching the filter
      const scrollParams: any = {
        limit: limit || 100,
        with_payload: true,
        with_vector: false,
      };

      if (qdrantFilter) {
        scrollParams.filter = qdrantFilter;
      }

      const result = await this.client!.scroll(collectionName, scrollParams);

      // Transform results to match expected format
      return result.points.map((point: any) => {
        const doc: Record<string, any> = { id: point.id };

        // Extract requested fields from payload
        outputFields.forEach((field) => {
          if (field === "id") {
            doc[field] = point.id;
          } else if (point.payload[field] !== undefined) {
            doc[field] = point.payload[field];
          }
        });

        return doc;
      });
    } catch (error) {
      console.error(
        `❌ Failed to query collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async createHybridCollection(
    collectionName: string,
    dimension: number,
    _description?: string
  ): Promise<void> {
    await this.ensureInitialized();

    console.log("Beginning hybrid collection creation:", collectionName);
    console.log("Collection dimension:", dimension);

    // Check if collection already exists
    const collections = await this.client!.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (exists) {
      console.log(
        `Collection '${collectionName}' already exists, skipping creation`
      );
      return;
    }

    // For now, create a regular collection with dense vectors only
    // TODO: Add sparse vector support when Qdrant configuration is stable
    const vectorsConfig = {
      size: dimension,
      distance: "Cosine" as const,
    };

    await createCollectionWithLimitCheck(this.client!, collectionName, {
      vectors: vectorsConfig,
      on_disk_payload: true,
    });

    // Create payload index for text field to enable full-text search
    await this.client!.createPayloadIndex(collectionName, {
      field_name: "content",
      field_schema: "text",
    });

    console.log(
      `✅ Hybrid collection '${collectionName}' created successfully`
    );
  }

  async insertHybrid(
    collectionName: string,
    documents: VectorDocument[]
  ): Promise<void> {
    await this.ensureInitialized();

    console.log(
      `Inserting ${documents.length} hybrid documents into collection:`,
      collectionName
    );

    // Transform documents to Qdrant point format with dense vectors
    // For now, use regular dense vectors until sparse vector support is stable
    const points = documents.map((doc) => {
      // Convert string ID to UUID format for Qdrant compatibility
      const uuidId = this.stringToUuid(doc.id);
      return {
        id: uuidId,
        vector: doc.vector, // Use dense vector directly
        payload: {
          content: doc.content,
          relativePath: doc.relativePath,
          startLine: doc.startLine,
          endLine: doc.endLine,
          fileExtension: doc.fileExtension,
          metadata: doc.metadata,
          originalId: doc.id, // Store original ID in payload for reference
        },
      };
    });

    // Batch insert
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.client!.upsert(collectionName, {
        points: batch,
        wait: true,
      });
    }

    console.log(
      `✅ Successfully inserted ${documents.length} hybrid documents`
    );
  }

  async hybridSearch(
    collectionName: string,
    searchRequests: HybridSearchRequest[],
    options?: HybridSearchOptions
  ): Promise<HybridSearchResult[]> {
    await this.ensureInitialized();

    try {
      console.log(
        `🔍 Preparing hybrid search for collection: ${collectionName}`
      );

      // Extract dense and sparse search requests
      const denseRequest = searchRequests.find(
        (req) =>
          req.anns_field === "vector" || req.anns_field === "dense_vector"
      );
      const sparseRequest = searchRequests.find(
        (req) => req.anns_field === "sparse_vector"
      );

      if (!denseRequest) {
        throw new Error(
          "Dense vector search request is required for hybrid search"
        );
      }

      // Prepare search parameters for regular collection (not named vectors)
      const searchParams: any = {
        vector: denseRequest.data, // Use the vector directly (it's already an array)
        limit: options?.limit || denseRequest.limit || 10,
        with_payload: true,
        with_vector: false,
      };

      // Apply filter if provided
      if (options?.filterExpr) {
        searchParams.filter = this.convertFilterExpression(options.filterExpr);
      }

      // If we have a sparse request, we'll need to combine results
      // For now, we'll use the dense vector search as the primary search
      // and optionally boost results based on text similarity
      let searchResult = await this.client!.search(
        collectionName,
        searchParams
      );

      // If sparse search is requested, we can use Qdrant's text search capabilities
      if (sparseRequest && typeof sparseRequest.data === "string") {
        // Perform text-based filtering to simulate sparse vector search
        const textQuery = sparseRequest.data;

        // Filter results based on content similarity (more flexible approach)
        searchResult = searchResult.filter((result: any) => {
          const content = result.payload.content.toLowerCase();
          const query = textQuery.toLowerCase();

          // Check if query contains multiple words
          const queryWords = query
            .split(/\s+/)
            .filter((word) => word.length > 2);

          if (queryWords.length === 1) {
            // Single word: exact match
            return content.includes(queryWords[0]);
          } else {
            // Multiple words: check if at least half of the words are present
            const matchingWords = queryWords.filter((word) =>
              content.includes(word)
            );
            return matchingWords.length >= Math.ceil(queryWords.length / 2);
          }
        });
      }

      console.log(`✅ Found ${searchResult.length} results from hybrid search`);

      // Transform results to HybridSearchResult format
      return searchResult.map((result: any) => ({
        document: {
          id: result.id,
          content: result.payload.content,
          vector: [],
          sparse_vector: [],
          relativePath: result.payload.relativePath,
          startLine: result.payload.startLine,
          endLine: result.payload.endLine,
          fileExtension: result.payload.fileExtension,
          metadata: result.payload.metadata || {},
        },
        score: result.score,
      }));
    } catch (error) {
      console.error(
        `❌ Failed to perform hybrid search on collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  /**
   * Convert string ID to UUID format for Qdrant compatibility
   * @param stringId - String ID to convert
   * @returns UUID string
   */
  private stringToUuid(stringId: string): string {
    // Create a deterministic UUID from string ID using a simple hash
    // This ensures the same string always produces the same UUID
    const hash = crypto.createHash("md5").update(stringId).digest("hex");

    // Format as UUID v4
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      "4" + hash.substring(13, 16), // Version 4
      ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
        hash.substring(17, 20), // Variant bits
      hash.substring(20, 32),
    ].join("-");
  }

  /**
   * Convert filter expressions to Qdrant filter format
   */
  private convertFilterExpression(filterExpr: string): any {
    // Return null if no filter expression provided
    if (!filterExpr || filterExpr.trim() === "") {
      return null;
    }

    // Handle common filter patterns
    // Example: fileExtension in [".ts", ".py"]
    const inMatch = filterExpr.match(/(\w+)\s+in\s+\[(.*?)\]/);
    if (inMatch) {
      const field = inMatch[1];
      const valuesStr = inMatch[2];
      const values = valuesStr
        .split(",")
        .map((v) => v.trim().replace(/["']/g, ""));

      return {
        should: values.map((value) => ({
          key: field,
          match: { value },
        })),
      };
    }

    // Handle equality: field == "value"
    const eqMatch = filterExpr.match(/(\w+)\s*==\s*["'](.+?)["']/);
    if (eqMatch) {
      return {
        must: [
          {
            key: eqMatch[1],
            match: { value: eqMatch[2] },
          },
        ],
      };
    }

    // Handle numeric comparisons: field > value
    const compMatch = filterExpr.match(/(\w+)\s*(>|>=|<|<=)\s*(\d+)/);
    if (compMatch) {
      const field = compMatch[1];
      const op = compMatch[2];
      const value = parseInt(compMatch[3]);

      const rangeFilter: any = { key: field, range: {} };
      if (op === ">") rangeFilter.range.gt = value;
      else if (op === ">=") rangeFilter.range.gte = value;
      else if (op === "<") rangeFilter.range.lt = value;
      else if (op === "<=") rangeFilter.range.lte = value;

      return { must: [rangeFilter] };
    }

    // If we can't parse the filter, return null
    console.warn(`Unable to parse filter expression: ${filterExpr}`);
    return null;
  }

  /**
   * Generate a simple sparse vector from text content
   * This is a simplified implementation - in production, you might want to use
   * proper BM25 or other text-based vectorization
   */
  private generateSparseVector(content: string): any {
    // Simple word frequency based sparse vector
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};

    words.forEach((word) => {
      if (word.length > 2) {
        // Skip very short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Convert to sparse vector format
    const indices: number[] = [];
    const values: number[] = [];

    Object.entries(wordFreq).forEach(([_word, freq], index) => {
      indices.push(index);
      values.push(freq);
    });

    return { indices, values };
  }
}
