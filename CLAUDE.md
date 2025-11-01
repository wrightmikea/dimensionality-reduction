# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D visualizations for dimensionality reduction techniques (PCA, LDA, Isomap) with support for real embedding analysis from multiple models. The tool visualizes high-dimensional embeddings (768d-3072d) in 3D space, supporting both local (Ollama) and cloud-based (OpenAI, Voyage, Cohere) embedding models.

## Development Commands

### Build & Run
```bash
# Build the project (transpiles src/ to dist/ using Babel)
npm run build

# Start local dev server (serves on http://0.0.0.0:4444)
npm run dev

# Build and start in one command
npm start
```

### Testing with Ollama (Local Embeddings)
```bash
# 1. Start Ollama in separate terminal
ollama serve

# 2. Start the app
npm run dev

# 3. Visit http://localhost:4444/index_ollama.html
```

### Working with Project Gutenberg Texts
```bash
# Download sample texts for testing
./download-texts.sh
```

## Architecture Overview

### Core Algorithm Module: `src/shared.js`
Central module containing all dimensionality reduction implementations:
- **PCA (Principal Component Analysis)**: Power iteration method for eigendecomposition
- **LDA (Linear Discriminant Analysis)**: Supervised reduction maximizing class separation
- **Isomap**: K-nearest neighbor graph with Floyd-Warshall shortest paths, followed by MDS

All algorithms are implemented from scratch without external ML libraries. They work with ANY input dimension (10D demo data up to 3072D embeddings).

### Embedding Architecture

**Local Embeddings: `src/ollama-embeddings.js`**
- `OllamaEmbeddings` class manages local Ollama models
- Connects to Ollama at `http://localhost:11434` by default
- Supports models: nomic-embed-text, granite-embedding, gemma-embed
- Batch processing with progress callbacks
- In-memory caching for performance

**Cloud Embeddings: `src/embedding-manager.js`**
- `EmbeddingManager` class provides unified interface for cloud providers
- Provider configurations define model, dimensions, and endpoints
- Built-in caching using Map with composite keys
- Cosine similarity search for query matching
- LocalStorage persistence for embeddings

**API Endpoints: `api/embed/`**
Serverless function templates for cloud providers:
- `openai.js`: OpenAI text-embedding-3-small (1536d) and 3-large (3072d)
- `voyage.js`: Voyage AI voyage-2 (1024d)
- Not yet implemented: Cohere embed-english-v3.0 (1024d)

These are meant to be deployed as serverless functions (Vercel, Netlify) with API keys in environment variables.

### Text Processing: `src/text-processor.js`
`TextProcessor` utility class for preparing text for embedding:
- **Chunking strategies**: by sentences, paragraphs, character count, or smart (chapter-aware)
- **Project Gutenberg parsing**: Extracts metadata and strips boilerplate
- **Book loading**: Fetches from `/texts/{id}.txt` (requires running `download-texts.sh`)
- **Statistics**: Word/sentence/paragraph counts for text analysis

### HTML Entry Points
- `index.html`: Landing page with links to all visualizations
- `index_pca.html`, `index_lda.html`, `index_isomap.html`: Synthetic data demos
- `index_ollama.html`: Local embedding visualization (Ollama models + Gutenberg texts)
- `index_embeddings.html`: Cloud embedding visualization with query search
- `index_comparison.html`: Side-by-side comparison of multiple embedding models

Each HTML file is standalone and includes the relevant algorithm code inline or via script tags.

## Key Design Patterns

### Algorithm Flow
1. Generate or load high-dimensional data (embeddings or synthetic)
2. Apply dimensionality reduction algorithm (PCA/LDA/Isomap)
3. Project to 3D coordinates
4. Render using Plotly.js with color-coded clusters
5. Optional: Query search highlights similar chunks

### Two-Stage Reduction for Performance
For very high dimensions (>2048d) with Isomap:
```javascript
// Fast PCA pre-reduction to intermediate dimension
const mid = pca(embeddings3072D, 128);
// Then Isomap for quality final reduction
const final = isomap(mid, 3, 12);
```

### Embedding Workflow
1. **Text chunking**: Use `TextProcessor` methods to split documents
2. **Generate embeddings**: Call API or Ollama endpoint for each chunk
3. **Dimensionality reduction**: Apply PCA (fastest) or Isomap (best quality)
4. **Visualization**: Plot in 3D with Plotly
5. **Query search**: Compute cosine similarity to highlight relevant chunks

## Performance Characteristics

| Dimensions | Points | PCA Time | Isomap Time |
|-----------|--------|----------|-------------|
| 10D       | 240    | ~10ms    | ~500ms      |
| 768D      | 240    | ~50ms    | ~2s         |
| 1536D     | 240    | ~100ms   | ~4s         |
| 3072D     | 240    | ~200ms   | ~8s         |

**Isomap complexity**: O(n^2) for distance matrix, O(n^3) for Floyd-Warshall. Use PCA for real-time applications.

## Environment Variables (for API deployment)

When deploying serverless functions:
- `OPENAI_API_KEY`: Required for OpenAI embeddings
- `VOYAGE_API_KEY`: Required for Voyage AI embeddings
- `COHERE_API_KEY`: Required for Cohere embeddings

## Important Implementation Notes

### LDA Label Requirements
LDA is supervised and requires labels. For real embeddings without labels, use PCA or Isomap instead.

### Isomap Connectivity
Isomap builds a k-NN graph. If the graph becomes disconnected:
- Algorithm handles this by replacing Infinity distances with 2x max finite distance
- Increase `nNeighbors` parameter if clusters appear artificially separated
- Default is 10 neighbors; try 15-20 for sparse high-dimensional data

### Caching Strategy
- **Ollama**: In-memory Map cache with `${model}:${text}` keys
- **Cloud APIs**: Map cache with `${model}:${JSON.stringify(chunks)}` keys
- **Persistence**: Use `EmbeddingManager.saveToStorage()` for localStorage caching

### Browser-Based Architecture
This is a pure frontend application with no backend required (except optional serverless API endpoints). All computation happens in the browser using vanilla JavaScript.

## Project Structure

```
src/
  shared.js              # Core PCA/LDA/Isomap implementations
  embedding-manager.js   # Cloud embedding utilities
  ollama-embeddings.js   # Local Ollama embedding utilities
  text-processor.js      # Text chunking and Gutenberg parsing

api/embed/
  openai.js             # OpenAI serverless function template
  voyage.js             # Voyage AI serverless function template

index*.html             # Standalone visualization pages
texts/                  # Project Gutenberg books (downloaded via script)
docs/                   # Background research documentation
```

## Common Modifications

### Adding a New Embedding Provider
1. Add provider config to `EmbeddingManager.providers` in `src/embedding-manager.js`
2. Create serverless function in `api/embed/{provider}.js`
3. Follow OpenAI endpoint pattern: POST request with `{model, texts}`, return `{embeddings}`

### Adjusting Chunk Sizes
Modify `TextProcessor` methods in `src/text-processor.js`:
- `chunkBySentences()`: Change `sentencesPerChunk` (default 5)
- `chunkByChars()`: Change `charsPerChunk` (default 500)
- `chunkByParagraphs()`: Change `maxChunks` (default 100)

### Tuning Algorithm Parameters
In `src/shared.js`:
- **PCA**: `nComponents` (target dimensions, default 3)
- **LDA**: `nComponents` (max is nClasses-1)
- **Isomap**: `nNeighbors` (default 10, increase for sparse data)

### Changing Visualization Colors
Plotly color scheme is in each HTML file's visualization code. Look for the `marker.color` property in the Plotly.newPlot() call.
