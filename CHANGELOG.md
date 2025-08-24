# 📋 Changelog

All notable changes to CodeSearch will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite with unit and integration tests
- GitHub Actions CI/CD pipeline
- Advanced search patterns and examples
- Complete API reference documentation
- Security policy and code of conduct
- Community support guidelines

### Changed

- Improved README with better value proposition and examples
- Enhanced package metadata for better discoverability
- Updated documentation structure and content

### Fixed

- Package.json repository URLs and metadata
- TypeScript configuration and build process

## [0.1.1] - 2024-01-15

### Added

- **Core Package (@codesearch/core)**

  - Semantic code search with natural language queries
  - Multi-language support (TypeScript, JavaScript, Python, Java, C++, Go, Rust, etc.)
  - AST-based intelligent code chunking
  - Incremental file synchronization using Merkle trees
  - Multiple embedding providers (OpenAI, VoyageAI, Gemini, Ollama)
  - Vector database support (Qdrant, Faiss)
  - Configurable ignore patterns and file filtering
  - Progress tracking for indexing operations
  - Comprehensive error handling and logging

- **MCP Server (@codesearch/mcp)**

  - Model Context Protocol server for AI assistant integration
  - Claude Desktop integration support
  - RESTful API endpoints for search operations
  - Configuration management via environment variables
  - Tool definitions for semantic search operations

- **Documentation**

  - Quick start guide with setup instructions
  - Environment variables configuration guide
  - Prerequisites and installation documentation
  - Basic usage examples
  - Troubleshooting FAQ

- **Examples**
  - Basic usage example with real codebase indexing
  - Integration examples for different use cases
  - Performance benchmarking scripts

### Features

#### 🧠 Intelligent Semantic Search

- Natural language queries like "authentication middleware" or "database connection pooling"
- Context-aware code discovery across multiple programming languages
- Similarity scoring and ranking of search results
- Configurable search thresholds and result limits

#### ⚡ High-Performance Indexing

- **Incremental Updates**: Only re-index changed files using Merkle tree-based change detection
- **Smart Chunking**: AST-based code splitting that preserves function and class boundaries
- **Batch Processing**: Efficient processing of large codebases with progress tracking
- **Parallel Processing**: Concurrent file processing for faster indexing

#### 🌐 Multi-Language Support

- **Web Technologies**: TypeScript, JavaScript, React, Vue, Angular
- **Backend Languages**: Python, Java, C++, C#, Go, Rust, PHP, Ruby
- **Mobile Development**: Swift, Kotlin, Objective-C
- **Data & Scripting**: SQL, R, Scala, Shell scripts
- **Documentation**: Markdown, reStructuredText

#### 🔌 Flexible Architecture

- **Embedding Providers**:
  - OpenAI (text-embedding-3-small, text-embedding-3-large)
  - VoyageAI (voyage-code-3, voyage-3)
  - Google Gemini (text-embedding-004)
  - Ollama (local models)
- **Vector Databases**:
  - Qdrant (local and cloud)
  - Faiss (local file-based)
- **Code Splitters**:
  - AST-based splitter with language-specific parsing
  - LangChain character-based splitter

#### 🛠️ Developer Experience

- **TypeScript Support**: Full TypeScript definitions and type safety
- **Progress Tracking**: Real-time progress callbacks for long-running operations
- **Error Handling**: Comprehensive error reporting with actionable messages
- **Configuration**: Flexible configuration options with sensible defaults
- **Debugging**: Detailed logging and debug information

#### 🔄 File Synchronization

- **Change Detection**: SHA-256 file hashing with Merkle tree organization
- **Snapshot Management**: Persistent state storage in `~/.context/merkle/`
- **Incremental Updates**: Only process changed, added, or removed files
- **Performance**: 10x faster re-indexing for large codebases

### Technical Specifications

#### Performance Metrics

- **Indexing Speed**: ~1000 files/minute on average hardware
- **Search Accuracy**: 90%+ relevance for semantic queries
- **Memory Efficiency**: Optimized vector storage with compression
- **Update Speed**: 10x faster incremental updates vs full re-indexing

#### Supported File Extensions

```
.ts, .tsx, .js, .jsx, .py, .java, .cpp, .c, .h, .hpp, .cs, .go, .rs,
.php, .rb, .swift, .kt, .scala, .m, .mm, .md, .markdown
```

#### Default Ignore Patterns

```
node_modules/**, dist/**, build/**, out/**, .git/**, .vscode/**, .idea/**,
*.min.js, *.bundle.js, *.map, *.log, coverage/**, .nyc_output/**
```

### Breaking Changes

- None (initial release)

### Migration Guide

- None (initial release)

### Known Issues

- Large files (>10MB) may cause memory issues during indexing
- Some Tree-sitter parsers may not handle all language syntax variations
- Embedding API rate limits may slow down indexing for very large codebases

### Dependencies

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Vector database (Qdrant recommended)
- Embedding provider API key (OpenAI recommended)

## [0.1.0] - 2024-01-10

### Added

- Initial project structure and monorepo setup
- Core package foundation with basic indexing
- MCP server basic implementation
- Development tooling and build configuration

### Internal

- TypeScript configuration and build system
- ESLint and code formatting setup
- Package management with pnpm workspaces
- Basic CI/CD pipeline setup

---

## Release Notes Format

Each release includes:

### 🚀 New Features

Major new functionality and capabilities

### 🐛 Bug Fixes

Resolved issues and error corrections

### 📈 Performance Improvements

Optimizations and speed enhancements

### 📖 Documentation

Documentation updates and improvements

### 🔧 Internal Changes

Development and maintenance updates

### ⚠️ Breaking Changes

Changes that may require code updates

### 🗑️ Deprecated

Features marked for future removal

### 🔒 Security

Security-related fixes and improvements

---

## Contributing to Changelog

When contributing to CodeSearch:

1. **Add entries** to the `[Unreleased]` section
2. **Use consistent formatting** following the established pattern
3. **Include issue/PR references** where applicable
4. **Categorize changes** appropriately
5. **Write clear descriptions** that help users understand the impact

### Example Entry Format

```markdown
### Added

- New semantic search feature for cross-language code discovery (#123)
- Support for Rust programming language indexing (#124)

### Fixed

- Resolved memory leak in large file processing (#125)
- Fixed incorrect line number reporting in search results (#126)

### Changed

- Improved search accuracy by 15% with better embedding strategies (#127)
- Updated default chunk size from 1000 to 2000 characters (#128)
```

---

For more information about releases, see our [Release Process](docs/development/release-process.md).
