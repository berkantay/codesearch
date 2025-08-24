# 📚 API Reference

Complete API reference for CodeSearch packages.

> **Maintained by [berkantay](https://github.com/berkantay)** • [🐛 Issues](https://github.com/berkantay/codesearch/issues) • [📧 Contact](mailto:berkantay@gmail.com)

## @codesearch/core

### Context Class

The main class for indexing and searching codebases.

#### Constructor

```typescript
new Context(config: ContextConfig)
```

**Parameters:**

- `config: ContextConfig` - Configuration object

**ContextConfig Interface:**

```typescript
interface ContextConfig {
  embedding?: Embedding; // Embedding provider (required)
  vectorDatabase?: VectorDatabase; // Vector database instance (required)
  codeSplitter?: Splitter; // Code splitting strategy (optional)
  supportedExtensions?: string[]; // File extensions to index (optional)
  ignorePatterns?: string[]; // Patterns to ignore (optional)
}
```

#### Methods

##### indexCodebase()

Index an entire codebase for semantic search.

```typescript
async indexCodebase(
  path: string,
  progressCallback?: (progress: IndexingProgress) => void
): Promise<IndexingStats>
```

**Parameters:**

- `path: string` - Path to the codebase directory
- `progressCallback?: (progress: IndexingProgress) => void` - Optional progress callback

**Returns:** `Promise<IndexingStats>`

**Example:**

```typescript
const stats = await context.indexCodebase("./my-project", (progress) => {
  console.log(`${progress.phase} - ${progress.percentage}%`);
});

console.log(
  `Indexed ${stats.indexedFiles} files with ${stats.totalChunks} chunks`
);
```

##### semanticSearch()

Perform semantic search on an indexed codebase.

```typescript
async semanticSearch(
  path: string,
  query: string,
  topK?: number,
  threshold?: number
): Promise<SemanticSearchResult[]>
```

**Parameters:**

- `path: string` - Path to the indexed codebase
- `query: string` - Natural language search query
- `topK?: number` - Maximum number of results (default: 5)
- `threshold?: number` - Minimum similarity threshold (default: 0.0)

**Returns:** `Promise<SemanticSearchResult[]>`

**Example:**

```typescript
const results = await context.semanticSearch(
  "./my-project",
  "function that handles user authentication",
  10,
  0.7
);

results.forEach((result) => {
  console.log(`${result.relativePath}:${result.startLine}-${result.endLine}`);
  console.log(`Score: ${result.score}`);
});
```

##### hasIndex()

Check if a codebase has been indexed.

```typescript
async hasIndex(path: string): Promise<boolean>
```

**Parameters:**

- `path: string` - Path to the codebase directory

**Returns:** `Promise<boolean>`

##### clearIndex()

Remove the index for a codebase.

```typescript
async clearIndex(
  path: string,
  progressCallback?: (progress: ClearProgress) => void
): Promise<void>
```

**Parameters:**

- `path: string` - Path to the codebase directory
- `progressCallback?: (progress: ClearProgress) => void` - Optional progress callback

##### updateIgnorePatterns()

Update the ignore patterns for file filtering.

```typescript
updateIgnorePatterns(patterns: string[]): void
```

**Parameters:**

- `patterns: string[]` - Array of glob patterns to ignore

##### updateEmbedding()

Switch to a different embedding provider.

```typescript
updateEmbedding(embedding: Embedding): void
```

**Parameters:**

- `embedding: Embedding` - New embedding provider instance

##### updateVectorDatabase()

Switch to a different vector database.

```typescript
updateVectorDatabase(vectorDB: VectorDatabase): void
```

**Parameters:**

- `vectorDB: VectorDatabase` - New vector database instance

### Embedding Providers

#### OpenAIEmbedding

```typescript
import { OpenAIEmbedding } from '@codesearch/core';

const embedding = new OpenAIEmbedding({
  apiKey: string;                    // OpenAI API key (required)
  model: 'text-embedding-3-small' | 'text-embedding-3-large'; // Model name
  maxRetries?: number;               // Max retry attempts (default: 3)
  timeout?: number;                  // Request timeout in ms (default: 30000)
});
```

**Methods:**

- `embed(text: string): Promise<number[]>` - Generate embedding for single text
- `embedBatch(texts: string[]): Promise<number[][]>` - Generate embeddings for multiple texts
- `getDimensions(): number` - Get embedding dimensions

#### VoyageAIEmbedding

```typescript
import { VoyageAIEmbedding } from '@codesearch/core';

const embedding = new VoyageAIEmbedding({
  apiKey: string;                    // VoyageAI API key (required)
  model: 'voyage-code-3' | 'voyage-3'; // Model name
  maxRetries?: number;               // Max retry attempts (default: 3)
  timeout?: number;                  // Request timeout in ms (default: 30000)
});
```

#### GeminiEmbedding

```typescript
import { GeminiEmbedding } from '@codesearch/core';

const embedding = new GeminiEmbedding({
  apiKey: string;                    // Google AI API key (required)
  model: 'text-embedding-004';      // Model name
  maxRetries?: number;               // Max retry attempts (default: 3)
  timeout?: number;                  // Request timeout in ms (default: 30000)
});
```

#### OllamaEmbedding

```typescript
import { OllamaEmbedding } from '@codesearch/core';

const embedding = new OllamaEmbedding({
  baseUrl: string;                   // Ollama server URL (default: 'http://localhost:11434')
  model: string;                     // Model name (e.g., 'nomic-embed-text')
  timeout?: number;                  // Request timeout in ms (default: 30000)
});
```

### Vector Databases

#### QdrantVectorDatabase

```typescript
import { QdrantVectorDatabase } from '@codesearch/core';

const vectorDB = new QdrantVectorDatabase({
  url: string;                       // Qdrant server URL (required)
  apiKey?: string;                   // API key for Qdrant Cloud (optional)
  timeout?: number;                  // Request timeout in ms (default: 30000)
  maxRetries?: number;               // Max retry attempts (default: 3)
});
```

**Methods:**

- `createCollection(name: string, dimension: number): Promise<void>`
- `deleteCollection(name: string): Promise<void>`
- `upsert(collection: string, points: VectorPoint[]): Promise<void>`
- `search(collection: string, vector: number[], options?: SearchOptions): Promise<SearchResult[]>`
- `delete(collection: string, ids: string[]): Promise<void>`

#### FaissVectorDatabase

```typescript
import { FaissVectorDatabase } from '@codesearch/core';

const vectorDB = new FaissVectorDatabase({
  indexPath: string;                 // Path to store FAISS index files
  dimension: number;                 // Embedding dimensions
  indexType?: 'flat' | 'ivf';       // Index type (default: 'flat')
});
```

### Code Splitters

#### ASTSplitter

AST-based code splitting with language-specific parsing.

```typescript
import { ASTSplitter } from '@codesearch/core';

const splitter = new ASTSplitter({
  maxChunkSize?: number;             // Maximum chunk size in characters (default: 2000)
  chunkOverlap?: number;             // Overlap between chunks (default: 200)
  respectFunctionBoundaries?: boolean; // Keep functions intact (default: true)
  respectClassBoundaries?: boolean;  // Keep classes intact (default: true)
});
```

#### LangChainSplitter

Character-based code splitting using LangChain.

```typescript
import { LangChainSplitter } from '@codesearch/core';

const splitter = new LangChainSplitter({
  maxChunkSize?: number;             // Maximum chunk size in characters (default: 2000)
  chunkOverlap?: number;             // Overlap between chunks (default: 200)
  separators?: string[];             // Custom separators
});
```

### Types and Interfaces

#### SemanticSearchResult

```typescript
interface SemanticSearchResult {
  content: string; // Code content
  relativePath: string; // File path relative to codebase root
  startLine: number; // Starting line number
  endLine: number; // Ending line number
  language: string; // Programming language
  score: number; // Similarity score (0-1)
  fileExtension: string; // File extension
}
```

#### IndexingStats

```typescript
interface IndexingStats {
  indexedFiles: number; // Number of files indexed
  skippedFiles: number; // Number of files skipped
  totalChunks: number; // Total code chunks created
  totalTokens: number; // Total tokens processed
  duration: number; // Indexing duration in ms
  errors: IndexingError[]; // Any errors encountered
}
```

#### IndexingProgress

```typescript
interface IndexingProgress {
  phase: "scanning" | "parsing" | "embedding" | "storing"; // Current phase
  percentage: number; // Progress percentage (0-100)
  currentFile?: string; // Currently processing file
  processedFiles: number; // Number of files processed
  totalFiles: number; // Total files to process
}
```

#### CodeChunk

```typescript
interface CodeChunk {
  content: string; // Code content
  startLine: number; // Starting line number
  endLine: number; // Ending line number
  language: string; // Programming language
  filePath: string; // Full file path
  relativePath: string; // Relative file path
  hash: string; // Content hash
}
```

## @codesearch/mcp

### MCP Server

Model Context Protocol server for AI assistant integration.

#### Configuration

```typescript
interface MCPConfig {
  openaiApiKey?: string; // OpenAI API key
  qdrantUrl?: string; // Qdrant server URL
  qdrantApiKey?: string; // Qdrant API key
  defaultEmbeddingModel?: string; // Default embedding model
  maxSearchResults?: number; // Maximum search results (default: 10)
  searchThreshold?: number; // Search similarity threshold (default: 0.0)
}
```

#### Tools

The MCP server provides the following tools:

##### codesearch_index

Index a codebase for semantic search.

**Parameters:**

- `path: string` - Path to the codebase directory
- `force?: boolean` - Force re-indexing (default: false)

##### codesearch_search

Perform semantic search on an indexed codebase.

**Parameters:**

- `path: string` - Path to the indexed codebase
- `query: string` - Natural language search query
- `limit?: number` - Maximum number of results (default: 5)
- `threshold?: number` - Minimum similarity threshold (default: 0.0)

##### codesearch_clear

Clear the index for a codebase.

**Parameters:**

- `path: string` - Path to the codebase directory

##### codesearch_status

Get indexing status for a codebase.

**Parameters:**

- `path: string` - Path to the codebase directory

#### Usage with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "codesearch": {
      "command": "npx",
      "args": ["@codesearch/mcp"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
        "QDRANT_URL": "http://localhost:6333",
        "QDRANT_API_KEY": "your-qdrant-api-key"
      }
    }
  }
}
```

## Error Handling

### Common Errors

#### IndexingError

```typescript
interface IndexingError {
  file: string; // File that caused the error
  error: string; // Error message
  line?: number; // Line number (if applicable)
  code?: string; // Error code
}
```

#### SearchError

```typescript
class SearchError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
  }
}
```

### Error Codes

- `EMBEDDING_FAILED` - Failed to generate embeddings
- `VECTOR_DB_ERROR` - Vector database operation failed
- `PARSING_ERROR` - Code parsing failed
- `FILE_NOT_FOUND` - File or directory not found
- `INVALID_CONFIG` - Invalid configuration provided
- `RATE_LIMIT_EXCEEDED` - API rate limit exceeded
- `INSUFFICIENT_PERMISSIONS` - Insufficient file permissions

## Environment Variables

### Core Package

```bash
# Embedding providers
OPENAI_API_KEY=your-openai-api-key
VOYAGEAI_API_KEY=your-voyageai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Vector databases
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key

# Performance tuning
CODESEARCH_MAX_CHUNK_SIZE=2000
CODESEARCH_CHUNK_OVERLAP=200
CODESEARCH_MAX_CONCURRENCY=4
CODESEARCH_CACHE_SIZE=1000

# Debugging
DEBUG=codesearch:*
CODESEARCH_LOG_LEVEL=info
```

### MCP Server

```bash
# Required
OPENAI_API_KEY=your-openai-api-key
QDRANT_URL=http://localhost:6333

# Optional
QDRANT_API_KEY=your-qdrant-api-key
CODESEARCH_MAX_RESULTS=10
CODESEARCH_SEARCH_THRESHOLD=0.0
CODESEARCH_DEFAULT_MODEL=text-embedding-3-small
```

## Performance Considerations

### Indexing Performance

- **Chunk Size**: Smaller chunks = more granular search, larger chunks = better context
- **Concurrency**: Adjust based on API rate limits and system resources
- **Batch Size**: Optimize for embedding provider batch limits

### Search Performance

- **Vector Database**: Qdrant generally faster than FAISS for large datasets
- **Caching**: Enable result caching for repeated queries
- **Filtering**: Use file filters to reduce search space

### Memory Usage

- **Large Codebases**: Consider using streaming indexing for very large projects
- **Embedding Dimensions**: Higher dimensions = better accuracy but more memory
- **Cache Management**: Implement LRU cache eviction for long-running processes

## Migration Guide

### From v0.0.x to v0.1.x

1. **Configuration Changes**:

   ```typescript
   // Old
   const context = new Context(embedding, vectorDB);

   // New
   const context = new Context({
     embedding,
     vectorDatabase: vectorDB,
   });
   ```

2. **Method Signature Changes**:

   ```typescript
   // Old
   await context.search(query, topK);

   // New
   await context.semanticSearch(path, query, topK);
   ```

3. **Import Changes**:

   ```typescript
   // Old
   import { Context, OpenAIEmbedding } from "codesearch";

   // New
   import { Context, OpenAIEmbedding } from "@codesearch/core";
   ```
