# Environment Variables Configuration

## 🎯 Global Configuration

CodeSearch supports a global configuration file at `~/.context/.env` to simplify MCP setup across different MCP clients.

**Benefits:**

- Configure once, use everywhere
- No need to specify environment variables in each MCP client
- Cleaner MCP configurations

## 📋 Environment Variable Priority

1. **Process Environment Variables** (highest)
2. **Global Configuration File** (`~/.context/.env`)
3. **Default Values** (lowest)

## 🔧 Required Environment Variables

### Embedding Provider

| Variable             | Description                                        | Default               |
| -------------------- | -------------------------------------------------- | --------------------- |
| `EMBEDDING_PROVIDER` | Provider: `OpenAI`, `VoyageAI`, `Gemini`, `Ollama` | `OpenAI`              |
| `OPENAI_API_KEY`     | OpenAI API key                                     | Required for OpenAI   |
| `VOYAGEAI_API_KEY`   | VoyageAI API key                                   | Required for VoyageAI |
| `GEMINI_API_KEY`     | Gemini API key                                     | Required for Gemini   |

### Vector Database

| Variable         | Description                                                 | Default                     |
| ---------------- | ----------------------------------------------------------- | --------------------------- |
| `QDRANT_URL`     | Qdrant server URL                                         | `http://localhost:6333`     |
| `QDRANT_API_KEY` | Qdrant API key (optional for local, required for cloud)   | Optional                    |

### Ollama (Local)

| Variable       | Description       | Default                  |
| -------------- | ----------------- | ------------------------ |
| `OLLAMA_HOST`  | Ollama server URL | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Model name        | `nomic-embed-text`       |

### Advanced Configuration

| Variable                 | Description                                                                          | Default |
| ------------------------ | ------------------------------------------------------------------------------------ | ------- |
| `HYBRID_MODE`            | Enable hybrid search (BM25 + dense vector). Set to `false` for dense-only search     | `true`  |
| `EMBEDDING_BATCH_SIZE`   | Batch size for processing. Larger batch size means less indexing time                | `100`   |
| `SPLITTER_TYPE`          | Code splitter type: `ast`, `langchain`                                               | `ast`   |
| `CUSTOM_EXTENSIONS`      | Additional file extensions to include (comma-separated, e.g., `.vue,.svelte,.astro`) | None    |
| `CUSTOM_IGNORE_PATTERNS` | Additional ignore patterns (comma-separated, e.g., `temp/**,*.backup,private/**`)    | None    |

## 🚀 Quick Setup

### 1. Create Global Config

```bash
mkdir -p ~/.context
cat > ~/.context/.env << 'EOF'
EMBEDDING_PROVIDER=OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
EOF
```

### 2. Simplified MCP Configuration

**Claude Code:**

```bash
claude mcp add codesearch -- npx @codesearch/mcp@latest
```

**Cursor/Windsurf/Others:**

```json
{
  "mcpServers": {
    "codesearch": {
      "command": "npx",
      "args": ["-y", "@codesearch/mcp@latest"]
    }
  }
}
```

## 📚 Additional Information

For detailed information about file processing rules and how custom patterns work, see:

- [What files does CodeSearch decide to embed?](../troubleshooting/faq.md#q-what-files-does-codesearch-decide-to-embed)
