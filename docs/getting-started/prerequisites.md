# Prerequisites

Before setting up Claude Context, ensure you have the following requirements met.

## Required Services

### Embedding Provider (Choose One)

#### Option 1: OpenAI (Recommended)

- **API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Billing**: Active billing account required
- **Models**: `text-embedding-3-small` or `text-embedding-3-large`
- **Rate Limits**: Check current limits on your OpenAI account

#### Option 2: VoyageAI

- **API Key**: Get from [VoyageAI Console](https://dash.voyageai.com/)
- **Models**: `voyage-code-3` (optimized for code)
- **Billing**: Pay-per-use pricing

#### Option 3: Gemini

- **API Key**: Get from [Google AI Studio](https://aistudio.google.com/)
- **Models**: `gemini-embedding-001`
- **Quota**: Check current quotas and limits

#### Option 4: Ollama (Local)

- **Installation**: Download from [ollama.ai](https://ollama.ai/)
- **Models**: Pull embedding models like `nomic-embed-text`
- **Hardware**: Sufficient RAM for model loading (varies by model)

### Vector Database

#### Qdrant Cloud (Recommended)

- **Account**: [Sign up](https://cloud.qdrant.io/) on Qdrant Cloud to get an API key.
- **Convenience**: Fully managed Qdrant vector database service without the need to install and manage it.

#### Local Qdrant (Advanced)

- **Docker**: Install Qdrant by following [this guide](https://qdrant.tech/documentation/guides/installation/)
- **Resources**: More complex configuration required

## Development Tools (Optional)

### For VSCode Extension

- **VSCode**: Version 1.74.0 or higher
- **Extensions**: Claude Context extension from marketplace

### For Development Contributions

- **Git**: For version control
- **pnpm**: Package manager (preferred over npm)
- **TypeScript**: Understanding of TypeScript development
