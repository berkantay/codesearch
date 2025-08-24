# Advanced Search Patterns Example

This example demonstrates advanced search patterns and techniques for getting the most out of CodeSearch's semantic capabilities.

## Overview

Learn how to:

- Craft effective semantic queries
- Use multi-modal search strategies
- Implement custom search filters
- Optimize search performance
- Handle large codebases efficiently

## Installation

```bash
cd examples/advanced-search-patterns
pnpm install
```

## Search Pattern Categories

### 🎯 Architectural Patterns

```typescript
import { AdvancedSearcher } from "./src/searcher";

const searcher = new AdvancedSearcher("./codebase");

// Find design patterns
const patterns = await searcher.findPatterns([
  "singleton pattern implementation",
  "factory pattern usage",
  "observer pattern subscribers",
  "dependency injection containers",
]);

// Discover architectural layers
const architecture = await searcher.discoverArchitecture([
  "controller layer handlers",
  "service layer business logic",
  "data access layer repositories",
  "middleware components",
]);
```

### 🔍 Code Quality Analysis

```typescript
// Find potential issues
const qualityIssues = await searcher.findQualityIssues([
  "functions with too many parameters",
  "deeply nested conditional logic",
  "duplicate code blocks",
  "missing error handling",
  "hardcoded configuration values",
]);

// Security vulnerability patterns
const securityIssues = await searcher.findSecurityPatterns([
  "SQL injection vulnerabilities",
  "XSS prevention measures",
  "authentication bypass attempts",
  "insecure data storage",
  "unvalidated user input",
]);
```

### 🚀 Performance Optimization

```typescript
// Find performance bottlenecks
const performance = await searcher.findPerformancePatterns([
  "database queries without indexes",
  "N+1 query problems",
  "memory leaks in event listeners",
  "inefficient loops and iterations",
  "blocking synchronous operations",
]);

// Caching strategies
const caching = await searcher.findCachingPatterns([
  "Redis cache implementations",
  "in-memory caching strategies",
  "cache invalidation logic",
  "cache-aside pattern usage",
]);
```

### 🔗 Integration Patterns

```typescript
// API integration patterns
const integrations = await searcher.findIntegrationPatterns([
  "REST API client implementations",
  "GraphQL query builders",
  "webhook handlers",
  "message queue consumers",
  "third-party service integrations",
]);

// Database patterns
const database = await searcher.findDatabasePatterns([
  "transaction management",
  "connection pooling",
  "migration scripts",
  "ORM model definitions",
  "database seeding logic",
]);
```

## Advanced Query Techniques

### 1. Multi-Perspective Search

```typescript
// Search from different angles
const multiSearch = await searcher.multiPerspectiveSearch(
  "user authentication",
  {
    perspectives: [
      "implementation details",
      "security considerations",
      "error handling",
      "testing strategies",
      "configuration options",
    ],
  }
);
```

### 2. Contextual Search

```typescript
// Search with context awareness
const contextualResults = await searcher.contextualSearch({
  query: "database connection",
  context: {
    fileTypes: [".ts", ".js"],
    directories: ["src/database", "src/models"],
    excludeTests: true,
    includeComments: true,
  },
});
```

### 3. Similarity Clustering

```typescript
// Group similar code patterns
const clusters = await searcher.findSimilarPatterns({
  query: "error handling middleware",
  clusterThreshold: 0.8,
  maxClusters: 5,
});

clusters.forEach((cluster, index) => {
  console.log(`Cluster ${index + 1}: ${cluster.pattern}`);
  cluster.files.forEach((file) => {
    console.log(`  - ${file.path}:${file.line}`);
  });
});
```

### 4. Cross-Language Search

```typescript
// Find similar patterns across languages
const crossLanguage = await searcher.crossLanguageSearch({
  query: "HTTP request handling",
  languages: ["typescript", "python", "java", "go"],
  compareImplementations: true,
});
```

## Custom Search Filters

### File-Based Filters

```typescript
const searcher = new AdvancedSearcher("./codebase", {
  filters: {
    // Only search in specific file types
    fileExtensions: [".ts", ".tsx", ".js", ".jsx"],

    // Exclude certain directories
    excludeDirectories: ["node_modules", "dist", "coverage"],

    // Include only files modified in last 30 days
    modifiedSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),

    // Size constraints
    maxFileSize: 1024 * 1024, // 1MB
    minFileSize: 100, // 100 bytes
  },
});
```

### Content-Based Filters

```typescript
const contentFilters = {
  // Must contain certain keywords
  mustContain: ["async", "await"],

  // Must not contain certain patterns
  mustNotContain: ["console.log", "debugger"],

  // Complexity filters
  maxCyclomaticComplexity: 10,
  maxNestingDepth: 4,

  // Documentation requirements
  requiresDocumentation: true,
  requiresTests: true,
};
```

## Performance Optimization Strategies

### 1. Incremental Indexing

```typescript
// Only re-index changed files
const incrementalSearcher = new AdvancedSearcher("./codebase", {
  indexing: {
    strategy: "incremental",
    watchForChanges: true,
    batchSize: 100,
    maxConcurrency: 4,
  },
});
```

### 2. Smart Caching

```typescript
// Cache search results
const cachedSearcher = new AdvancedSearcher("./codebase", {
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000, // Max cached queries
    strategy: "lru", // Least recently used
  },
});
```

### 3. Parallel Processing

```typescript
// Process multiple queries in parallel
const parallelResults = await Promise.all([
  searcher.search("authentication logic"),
  searcher.search("database operations"),
  searcher.search("error handling"),
  searcher.search("API endpoints"),
]);
```

## Real-World Examples

### 1. Code Review Assistant

```typescript
async function reviewPullRequest(prFiles: string[]) {
  const reviewer = new CodeReviewSearcher("./codebase");

  const issues = [];

  for (const file of prFiles) {
    // Check for common issues
    const fileIssues = await reviewer.analyzeFile(file, [
      "missing error handling",
      "potential security vulnerabilities",
      "performance anti-patterns",
      "code style violations",
      "missing tests",
    ]);

    issues.push(...fileIssues);
  }

  return issues;
}
```

### 2. Documentation Generator

```typescript
async function generateDocumentation(modulePattern: string) {
  const docGenerator = new DocumentationSearcher("./codebase");

  // Find all modules matching pattern
  const modules = await docGenerator.findModules(modulePattern);

  const documentation = [];

  for (const module of modules) {
    const doc = await docGenerator.generateModuleDoc(module, {
      includeExamples: true,
      includeTypes: true,
      includeUsage: true,
    });

    documentation.push(doc);
  }

  return documentation;
}
```

### 3. Migration Assistant

```typescript
async function findMigrationCandidates(oldPattern: string, newPattern: string) {
  const migrator = new MigrationSearcher("./codebase");

  // Find code using old patterns
  const candidates = await migrator.findPattern(oldPattern);

  // Analyze migration complexity
  const analysis = await migrator.analyzeMigration(candidates, {
    targetPattern: newPattern,
    estimateEffort: true,
    findDependencies: true,
    suggestRefactoring: true,
  });

  return analysis;
}
```

## Best Practices

### 🎯 Query Design

1. **Be Specific**: Use descriptive, specific queries

   ```typescript
   // Good
   "JWT token validation middleware";

   // Less effective
   "authentication";
   ```

2. **Use Context**: Include relevant context in queries

   ```typescript
   "React component that handles form validation with error messages";
   ```

3. **Combine Approaches**: Use multiple search strategies
   ```typescript
   const results = await Promise.all([
     searcher.semanticSearch(query),
     searcher.keywordSearch(keywords),
     searcher.structuralSearch(pattern),
   ]);
   ```

### ⚡ Performance

1. **Batch Operations**: Process multiple queries together
2. **Use Filters**: Narrow search scope with filters
3. **Cache Results**: Cache frequent queries
4. **Monitor Performance**: Track search times and optimize

### 🔧 Maintenance

1. **Regular Re-indexing**: Keep indexes up to date
2. **Monitor Quality**: Track search result relevance
3. **Update Patterns**: Evolve search patterns with codebase
4. **Clean Up**: Remove obsolete cached results

## Running Examples

```bash
# Basic patterns
pnpm run patterns:basic

# Advanced techniques
pnpm run patterns:advanced

# Performance benchmarks
pnpm run patterns:benchmark

# Interactive explorer
pnpm run patterns:interactive
```

## Next Steps

- Explore [Performance Optimization](../performance-optimization) for large codebases
- Check out [Custom Embeddings](../custom-embeddings) for domain-specific search
- See [Multi-Repository Search](../multi-repo) for organization-wide search
