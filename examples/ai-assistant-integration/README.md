# 🤖 AI Assistant Integration Example

This example demonstrates how to integrate CodeSearch with AI assistants like Claude, GPT, or other language models to provide intelligent code search capabilities.

> **Part of [CodeSearch](https://github.com/berkantay/codesearch)** by [berkantay](https://github.com/berkantay)

## Overview

This example shows how to:

- Set up CodeSearch for AI assistant integration
- Create semantic search endpoints
- Handle natural language queries
- Format results for AI consumption
- Implement context-aware code discovery

## Prerequisites

1. **API Keys**: Set up your API keys

   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   export ANTHROPIC_API_KEY="your-anthropic-api-key"  # Optional for Claude
   ```

2. **Vector Database**: Set up Qdrant
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   export QDRANT_URL="http://localhost:6333"
   ```

## Installation

```bash
cd examples/ai-assistant-integration
pnpm install
```

## Usage

### Basic Integration

```typescript
import { CodeSearchAssistant } from "./src/assistant";

const assistant = new CodeSearchAssistant({
  codebasePath: "./my-project",
  openaiApiKey: process.env.OPENAI_API_KEY,
  qdrantUrl: process.env.QDRANT_URL,
});

// Initialize and index the codebase
await assistant.initialize();

// Ask natural language questions
const response = await assistant.ask(
  "How does user authentication work in this codebase?"
);

console.log(response);
```

### Advanced Queries

```typescript
// Find specific patterns
const authCode = await assistant.findCode(
  "authentication middleware that validates JWT tokens"
);

// Get code explanations
const explanation = await assistant.explainCode(
  "src/auth/middleware.ts",
  "What does this middleware do?"
);

// Find related code
const related = await assistant.findRelated(
  "src/database/connection.ts",
  "Find all files that use this database connection"
);
```

## Features Demonstrated

### 🤖 Natural Language Queries

- Convert human questions to semantic searches
- Context-aware code discovery
- Multi-turn conversations with code context

### 🔍 Intelligent Code Search

- Semantic similarity matching
- Cross-language code discovery
- Pattern-based code finding

### 📊 Rich Response Formatting

- Code snippets with syntax highlighting
- File location and line numbers
- Relevance scoring and ranking

### 🧠 Context Management

- Conversation history tracking
- Code context accumulation
- Smart context pruning

## Running the Example

1. **Start the assistant server**:

   ```bash
   pnpm start
   ```

2. **Try example queries**:

   ```bash
   # Interactive mode
   pnpm run interactive

   # Batch processing
   pnpm run batch-queries
   ```

## Example Queries

Here are some example queries you can try:

```typescript
// Architecture questions
"How is the application structured?";
"What design patterns are used?";
"Show me the main entry points";

// Feature discovery
"How does user registration work?";
"Where is payment processing handled?";
"Find all API endpoints";

// Code quality
"Are there any security vulnerabilities?";
"Find duplicate code patterns";
"Show me error handling strategies";

// Dependencies
"What external libraries are used?";
"Find all database queries";
"Show me configuration files";
```

## Integration Patterns

### Claude Desktop Integration

```json
{
  "mcpServers": {
    "codesearch": {
      "command": "npx",
      "args": ["@codesearch/mcp"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "QDRANT_URL": "http://localhost:6333"
      }
    }
  }
}
```

### Custom API Integration

```typescript
import express from "express";
import { CodeSearchAssistant } from "./src/assistant";

const app = express();
const assistant = new CodeSearchAssistant(config);

app.post("/search", async (req, res) => {
  const { query, codebasePath } = req.body;
  const results = await assistant.semanticSearch(codebasePath, query);
  res.json(results);
});

app.post("/ask", async (req, res) => {
  const { question, context } = req.body;
  const response = await assistant.ask(question, context);
  res.json({ response });
});
```

## Best Practices

### 🎯 Query Optimization

- Use specific, descriptive queries
- Include context about what you're looking for
- Combine multiple search strategies

### 📝 Context Management

- Keep conversation context relevant
- Prune old context when it becomes too large
- Use code snippets strategically

### ⚡ Performance

- Index codebases incrementally
- Cache frequent queries
- Use appropriate chunk sizes

### 🔒 Security

- Sanitize user inputs
- Validate file paths
- Respect access permissions

## Troubleshooting

### Common Issues

1. **No search results**: Check if codebase is indexed
2. **Slow responses**: Optimize chunk size and vector dimensions
3. **Memory issues**: Implement context pruning
4. **API rate limits**: Add request throttling

### Debug Mode

```bash
DEBUG=codesearch:* pnpm start
```

## Next Steps

- Explore the [MCP Server example](../mcp-server) for Claude integration
- Check out [Advanced Search Patterns](../advanced-search) for complex queries
- See [Performance Optimization](../performance) for large codebases
