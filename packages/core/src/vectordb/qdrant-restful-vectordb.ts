import {
  VectorDocument,
  SearchOptions,
  VectorSearchResult,
  VectorDatabase,
  HybridSearchRequest,
  HybridSearchOptions,
  HybridSearchResult,
} from "./types";

export interface QdrantRestfulConfig {
  url?: string;
  apiKey?: string;
  host?: string;
  port?: number;
  https?: boolean;
}

/**
 * Wrapper function to handle collection creation with limit detection
 */
async function createCollectionWithLimitCheck(
  makeRequestFn: (endpoint: string, method: string, data?: any) => Promise<any>,
  collectionName: string,
  config: any
): Promise<void> {
  try {
    await makeRequestFn(`/collections/${collectionName}`, "PUT", config);
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

/**
 * Qdrant Vector Database implementation using REST API
 * This implementation is designed for environments where direct client usage is not available,
 * such as VSCode extensions or browser environments.
 */
export class QdrantRestfulVectorDatabase implements VectorDatabase {
  protected config: QdrantRestfulConfig;
  private baseUrl: string | null = null;
  protected initializationPromise: Promise<void>;

  constructor(config: QdrantRestfulConfig) {
    this.config = config;

    // Start initialization asynchronously without waiting
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    // Build base URL from config
    if (this.config.url) {
      this.baseUrl = this.config.url.replace(/\/$/, "");
    } else {
      const protocol = this.config.https ?? true ? "https" : "http";
      const host = this.config.host || "localhost";
      const port = this.config.port || 6333;
      this.baseUrl = `${protocol}://${host}:${port}`;
    }

    console.log(`🔌 Connecting to Qdrant REST API at: ${this.baseUrl}`);
  }

  /**
   * Ensure initialization is complete before method execution
   */
  protected async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
    if (!this.baseUrl) {
      throw new Error("Base URL not initialized");
    }
  }

  /**
   * Make HTTP request to Qdrant REST API
   */
  private async makeRequest(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Handle authentication
    if (this.config.apiKey) {
      headers["api-key"] = this.config.apiKey;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);

      const responseText = await response.text();
      let result: any;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            result.status?.error || result.message || response.statusText
          }`
        );
      }

      return result;
    } catch (error) {
      console.error(`Qdrant REST API request failed:`, error);
      throw error;
    }
  }

  async createCollection(
    collectionName: string,
    dimension: number,
    _description?: string
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log("Beginning collection creation:", collectionName);
      console.log("Collection dimension:", dimension);

      // Check if collection already exists
      try {
        await this.makeRequest(`/collections/${collectionName}`, "GET");
        console.log(
          `Collection '${collectionName}' already exists, skipping creation`
        );
        return;
      } catch (_error: any) {
        // Collection doesn't exist, proceed with creation
      }

      const collectionConfig = {
        vectors: {
          size: dimension,
          distance: "Cosine",
        },
      };

      await createCollectionWithLimitCheck(
        this.makeRequest.bind(this),
        collectionName,
        collectionConfig
      );

      console.log(`✅ Collection '${collectionName}' created successfully`);
    } catch (error) {
      console.error(
        `❌ Failed to create collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async dropCollection(collectionName: string): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.makeRequest(`/collections/${collectionName}`, "DELETE");
      console.log(`✅ Collection '${collectionName}' dropped successfully`);
    } catch (error) {
      console.error(`❌ Failed to drop collection '${collectionName}':`, error);
      throw error;
    }
  }

  async hasCollection(collectionName: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      await this.makeRequest(`/collections/${collectionName}`, "GET");
      return true;
    } catch (error: any) {
      if (error.message.includes("404")) {
        return false;
      }
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    await this.ensureInitialized();

    try {
      const response = await this.makeRequest("/collections", "GET");
      return (response.result?.collections || []).map((c: any) => c.name);
    } catch (error) {
      console.error(`❌ Failed to list collections:`, error);
      throw error;
    }
  }

  async insert(
    collectionName: string,
    documents: VectorDocument[]
  ): Promise<void> {
    await this.ensureInitialized();

    try {
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
          metadata: JSON.stringify(doc.metadata), // Stringify metadata for consistency
        },
      }));

      // Batch insert
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);

        await this.makeRequest(`/collections/${collectionName}/points`, "PUT", {
          points: batch,
        });
      }

      console.log(`✅ Successfully inserted ${documents.length} documents`);
    } catch (error) {
      console.error(
        `❌ Failed to insert documents into collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async search(
    collectionName: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<VectorSearchResult[]> {
    await this.ensureInitialized();

    const topK = options?.topK || 10;

    try {
      const searchRequest: any = {
        vector: queryVector,
        limit: topK,
        with_payload: true,
        with_vector: false,
      };

      // Apply filter if provided
      if (options?.filterExpr) {
        const filter = this.convertFilterExpression(options.filterExpr);
        if (filter) {
          searchRequest.filter = filter;
        }
      }

      const response = await this.makeRequest(
        `/collections/${collectionName}/points/search`,
        "POST",
        searchRequest
      );

      // Transform response to VectorSearchResult format
      const results: VectorSearchResult[] = (response.result || []).map(
        (item: any) => {
          // Parse metadata from JSON string
          let metadata = {};
          try {
            metadata = JSON.parse(item.payload.metadata || "{}");
          } catch (error) {
            console.warn(
              `Failed to parse metadata for item ${item.id}:`,
              error
            );
            metadata = {};
          }

          return {
            document: {
              id: item.id,
              vector: queryVector,
              content: item.payload.content || "",
              relativePath: item.payload.relativePath || "",
              startLine: item.payload.startLine || 0,
              endLine: item.payload.endLine || 0,
              fileExtension: item.payload.fileExtension || "",
              metadata: metadata,
            },
            score: item.score || 0,
          };
        }
      );

      return results;
    } catch (error) {
      console.error(
        `❌ Failed to search in collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async delete(collectionName: string, ids: string[]): Promise<void> {
    await this.ensureInitialized();

    try {
      const deleteRequest = {
        points: ids,
      };

      await this.makeRequest(
        `/collections/${collectionName}/points/delete`,
        "POST",
        deleteRequest
      );
      console.log(
        `✅ Successfully deleted ${ids.length} documents from collection '${collectionName}'`
      );
    } catch (error) {
      console.error(
        `❌ Failed to delete documents from collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async query(
    collectionName: string,
    filter: string,
    outputFields: string[],
    limit?: number
  ): Promise<Record<string, any>[]> {
    await this.ensureInitialized();

    try {
      const qdrantFilter = this.convertFilterExpression(filter);

      const scrollRequest: any = {
        limit: limit || 100,
        with_payload: true,
        with_vector: false,
      };

      if (qdrantFilter) {
        scrollRequest.filter = qdrantFilter;
      }

      const response = await this.makeRequest(
        `/collections/${collectionName}/points/scroll`,
        "POST",
        scrollRequest
      );

      // Transform results to match expected format
      return (response.result?.points || []).map((point: any) => {
        const doc: Record<string, any> = { id: point.id };

        // Extract requested fields from payload
        outputFields.forEach((field) => {
          if (field === "id") {
            doc[field] = point.id;
          } else if (
            field === "metadata" &&
            typeof point.payload.metadata === "string"
          ) {
            try {
              doc[field] = JSON.parse(point.payload.metadata);
            } catch {
              doc[field] = point.payload.metadata;
            }
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

    try {
      console.log("Beginning hybrid collection creation:", collectionName);
      console.log("Collection dimension:", dimension);

      // Check if collection already exists
      try {
        await this.makeRequest(`/collections/${collectionName}`, "GET");
        console.log(
          `Collection '${collectionName}' already exists, skipping creation`
        );
        return;
      } catch (_error: any) {
        // Collection doesn't exist, proceed with creation
      }

      // Qdrant supports multiple named vectors in a collection
      const collectionConfig = {
        vectors: {
          dense_vector: {
            size: dimension,
            distance: "Cosine",
          },
          sparse_vector: {
            size: 0, // Sparse vectors have dynamic size
            distance: "Dot",
          },
        },
        on_disk_payload: true,
      };

      await createCollectionWithLimitCheck(
        this.makeRequest.bind(this),
        collectionName,
        collectionConfig
      );

      // Create text index for content field
      await this.makeRequest(`/collections/${collectionName}/index`, "PUT", {
        field_name: "content",
        field_schema: "text",
      });

      console.log(
        `✅ Hybrid collection '${collectionName}' created successfully`
      );
    } catch (error) {
      console.error(
        `❌ Failed to create hybrid collection '${collectionName}':`,
        error
      );
      throw error;
    }
  }

  async insertHybrid(
    collectionName: string,
    documents: VectorDocument[]
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log(
        `Inserting ${documents.length} hybrid documents into collection:`,
        collectionName
      );

      // Transform documents to Qdrant point format with multiple vectors
      const points = documents.map((doc) => {
        // Generate sparse vector from content
        const sparseVector = this.generateSparseVector(doc.content);

        return {
          id: doc.id,
          vectors: {
            dense_vector: doc.vector,
            sparse_vector: sparseVector,
          },
          payload: {
            content: doc.content,
            relativePath: doc.relativePath,
            startLine: doc.startLine,
            endLine: doc.endLine,
            fileExtension: doc.fileExtension,
            metadata: JSON.stringify(doc.metadata),
          },
        };
      });

      // Batch insert
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);

        await this.makeRequest(`/collections/${collectionName}/points`, "PUT", {
          points: batch,
        });
      }

      console.log(
        `✅ Successfully inserted ${documents.length} hybrid documents`
      );
    } catch (error) {
      console.error(
        `❌ Failed to insert hybrid documents to collection '${collectionName}':`,
        error
      );
      throw error;
    }
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

      // Prepare search parameters for dense vector
      const searchRequest: any = {
        vector: {
          name: "dense_vector",
          vector: Array.isArray(denseRequest.data)
            ? denseRequest.data[0]
            : denseRequest.data,
        },
        limit: options?.limit || denseRequest.limit || 10,
        with_payload: true,
        with_vector: false,
      };

      // Apply filter if provided
      if (options?.filterExpr) {
        searchRequest.filter = this.convertFilterExpression(options.filterExpr);
      }

      // Perform the search
      const response = await this.makeRequest(
        `/collections/${collectionName}/points/search`,
        "POST",
        searchRequest
      );

      let results = response.result || [];

      // If sparse search is requested, filter results based on text content
      if (sparseRequest && typeof sparseRequest.data === "string") {
        const textQuery = sparseRequest.data.toLowerCase();

        // Score boost for text matches
        results = results.map((result: any) => {
          const content = (result.payload.content || "").toLowerCase();
          const textScore = content.includes(textQuery) ? 0.2 : 0;
          return {
            ...result,
            score: result.score + textScore,
          };
        });

        // Re-sort by score
        results.sort((a: any, b: any) => b.score - a.score);
      }

      console.log(`✅ Found ${results.length} results from hybrid search`);

      // Transform results to HybridSearchResult format
      return results.map((result: any) => {
        let metadata = {};
        try {
          metadata = JSON.parse(result.payload.metadata || "{}");
        } catch {
          metadata = {};
        }

        return {
          document: {
            id: result.id,
            content: result.payload.content,
            vector: [],
            sparse_vector: [],
            relativePath: result.payload.relativePath,
            startLine: result.payload.startLine,
            endLine: result.payload.endLine,
            fileExtension: result.payload.fileExtension,
            metadata: metadata,
          },
          score: result.score,
        };
      });
    } catch (error) {
      console.error(
        `❌ Failed to perform hybrid search on collection '${collectionName}':`,
        error
      );
      throw error;
    }
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
