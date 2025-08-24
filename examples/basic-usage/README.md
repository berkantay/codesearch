# 🚀 Basic Usage Example

This example demonstrates the basic usage of CodeSearch - perfect for getting started with semantic code search.

> **Part of [CodeSearch](https://github.com/berkantay/codesearch)** by [berkantay](https://github.com/berkantay)

## Prerequisites

1. **OpenAI API Key**: Set your OpenAI API key for embeddings:

   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   ```

2. **Vector Database**: Set up Qdrant for vector storage:

- **Local Qdrant** (recommended for development):

  ```bash
  docker run -p 6333:6333 qdrant/qdrant
  export QDRANT_URL="http://localhost:6333"
  ```

- **Qdrant Cloud** (managed service):
  Sign up at [cloud.qdrant.io](https://cloud.qdrant.io) and get your API key:
  ```bash
  export QDRANT_URL="https://your-cluster.qdrant.io"
  export QDRANT_API_KEY="your-qdrant-api-key"
  ```

## Running the Example

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set environment variables (see examples above)

3. Run the example:
   ```bash
   pnpm run start
   ```

## What This Example Does

1. **Indexes Codebase**: Indexes the entire CodeSearch project
2. **Performs Searches**: Executes semantic searches for different code patterns
3. **Shows Results**: Displays search results with similarity scores and file locations

## Expected Output

```
🚀 CodeSearch Real Usage Example
===============================
...
🔌 Connecting to vector database at: ...

📖 Starting to index codebase...
🗑️  Existing index found, clearing it first...
📊 Indexing stats: 45 files, 234 code chunks

🔍 Performing semantic search...

🔎 Search: "vector database operations"
   1. Similarity: 89.23%
      File: /path/to/packages/core/src/vectordb/qdrant-vectordb.ts
      Language: typescript
      Lines: 147-177
      Preview: async search(collectionName: string, queryVector: number[], options?: SearchOptions)...

🎉 Example completed successfully!
```
