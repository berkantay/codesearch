# 🐍 Python → TypeScript CodeSearch Bridge

A simple utility to call TypeScript CodeSearch methods from Python.

> **Part of [CodeSearch](https://github.com/berkantay/codesearch)** by [berkantay](https://github.com/berkantay)

## What's This?

This directory contains a basic bridge that allows you to run CodeSearch TypeScript functions from Python scripts. It's not a full SDK - just a simple way to test and use the TypeScript codebase from Python.

## Files

- `ts_executor.py` - Executes TypeScript methods from Python
- `test_context.ts` - TypeScript test script with CodeSearch workflow
- `test_endtoend.py` - Python script that calls the TypeScript test

## Prerequisites

```bash
# Make sure you have Node.js dependencies installed
cd .. && pnpm install

# Set your OpenAI API key (required for actual indexing)
export OPENAI_API_KEY="your-openai-api-key"

# Optional: Set Qdrant URL (defaults to http://localhost:6333)
export QDRANT_URL="http://localhost:6333"
```

## Quick Usage

```bash
# Run the end-to-end test
python test_endtoend.py
```

This will:

1. Create embeddings using OpenAI
2. Connect to Qdrant vector database
3. Index the `packages/core/src` codebase
4. Perform a semantic search
5. Show results

## Manual Usage

```python
from ts_executor import TypeScriptExecutor

executor = TypeScriptExecutor()
result = executor.call_method(
    './test_context.ts',
    'testContextEndToEnd',
    {
        'openaiApiKey': 'sk-your-key',
        'qdrantUrl': 'http://localhost:6333',
        'codebasePath': '../packages/core/src',
        'searchQuery': 'vector database configuration'
    }
)

print(result)
```

## How It Works

1. `ts_executor.py` creates temporary TypeScript wrapper files
2. Runs them with `ts-node`
3. Captures JSON output and returns to Python
4. Supports async functions and complex parameters

That's it! This is just a simple bridge for testing purposes.
