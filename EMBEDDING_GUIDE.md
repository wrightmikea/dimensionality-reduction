# Embedding Visualization Guide

This guide explains how to use the tool for visualizing real embeddings from various models.

## Quick Start

1. **Open the embedding visualization page**: `index_embeddings.html`
2. **Start with demo mode** to understand the interface
3. **Implement API endpoints** for real embeddings (see below)
4. **Compare models** using `index_comparison.html`

## Features

### 1. Embedding Visualization (`index_embeddings.html`)

**What it does:**
- Visualizes high-dimensional embeddings (768d-3072d) in 3D space
- Supports multiple embedding models (OpenAI, Voyage, Cohere, etc.)
- Query-based search with similarity highlighting
- Interactive 3D plots with hover text

**Workflow:**
```
Text Chunks → Embedding API → High-D Vectors → PCA/Isomap → 3D Visualization
                                                              ↓
                                              Query Search + Highlighting
```

### 2. Model Comparison (`index_comparison.html`)

**What it does:**
- Side-by-side comparison of different embedding models
- Same chunks get same colors across models
- Identify clustering differences between models
- Useful for selecting the best model for your use case

**Use Cases:**
- Evaluate which model best separates your specific content types
- Identify models with similar semantic understanding
- Debug embedding quality issues

## Implementation Options

### Option 1: Serverless Functions (Recommended)

**Pros:**
- No server management
- Secure API key handling
- Auto-scaling
- Free tier available

**Deployment:**

#### Vercel
```bash
npm install -g vercel
vercel deploy
```

Set environment variables:
```bash
vercel env add OPENAI_API_KEY
vercel env add VOYAGE_API_KEY
# etc.
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

Add environment variables in Netlify UI or:
```bash
netlify env:set OPENAI_API_KEY your-key-here
```

### Option 2: Node.js Server

Create `server.js`:

```javascript
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());
app.use(express.static('.')); // Serve static files

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/embed/openai', async (req, res) => {
  try {
    const { model, texts } = req.body;

    const response = await openai.embeddings.create({
      model: model || 'text-embedding-3-small',
      input: texts
    });

    const embeddings = response.data.map(item => item.embedding);

    res.json({
      embeddings,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

Run:
```bash
npm install express openai
export OPENAI_API_KEY=your-key-here
node server.js
```

### Option 3: Client-Side Only (For Testing)

**Warning**: Exposes API keys! Only use for local testing.

Modify `src/embedding-manager.js`:

```javascript
async generateEmbeddings(chunks, modelKey) {
  // Direct API call (not recommended for production)
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_API_KEY}` // Exposed!
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: chunks
    })
  });
  // ... rest of implementation
}
```

## API Endpoint Specifications

All endpoints should accept `POST` requests with:

### Request Format
```json
{
  "model": "text-embedding-3-small",
  "texts": [
    "First chunk of text",
    "Second chunk of text",
    "Third chunk of text"
  ]
}
```

### Response Format
```json
{
  "embeddings": [
    [0.123, -0.456, ...], // 1536 dimensions
    [0.789, -0.012, ...],
    [0.345, -0.678, ...]
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 45,
    "total_tokens": 45
  }
}
```

## Supported Embedding Models

### OpenAI
- **text-embedding-3-small**: 1536 dimensions, $0.02/1M tokens
- **text-embedding-3-large**: 3072 dimensions, $0.13/1M tokens
- Max input: 8191 tokens

### Voyage AI
- **voyage-2**: 1024 dimensions
- **voyage-large-2**: 1536 dimensions
- Max input: 16,000 tokens

### Cohere
- **embed-english-v3.0**: 1024 dimensions
- **embed-multilingual-v3.0**: 1024 dimensions
- Max input: 512 tokens

### Anthropic (via AWS Bedrock)
- **claude-3-haiku**: Via Bedrock, custom dimensions
- Requires AWS setup

## Query Highlighting

The query search feature works by:

1. **Generate query embedding** using the same model
2. **Compute cosine similarity** to all chunk embeddings
3. **Rank chunks** by similarity score
4. **Highlight top-K** in the visualization

**Visual encoding:**
- Red points = Most similar chunks
- Larger size = Higher similarity
- Gray points = Less similar chunks

**Use cases:**
- Find relevant documentation chunks
- Identify semantic clusters
- Debug embedding quality

## Model Comparison Tips

### Interpreting Results

1. **Tight clusters** = Model has strong semantic understanding
2. **Overlapping clusters** = Model may not distinguish well between those categories
3. **Similar cluster patterns** = Models have similar semantic understanding
4. **Different patterns** = Models focus on different aspects

### Example Analysis

If comparing embeddings of:
- Technical documentation
- Customer support tickets
- Marketing content

Look for:
- ✅ **Good**: Clear separation between the three types
- ⚠️ **Warning**: Tech docs and support tickets overlap
- ❌ **Bad**: All content mixed together

## Cost Optimization

1. **Cache embeddings**: Use `localStorage` or a database
2. **Batch requests**: Process multiple chunks at once
3. **Use smaller models**: Start with 3-small, upgrade if needed
4. **Limit dimensions**: Some models support dimension reduction

Example caching:

```javascript
const cacheKey = `${model}:${JSON.stringify(chunks)}`;
const cached = localStorage.getItem(cacheKey);
if (cached) return JSON.parse(cached);

// Generate embeddings...

localStorage.setItem(cacheKey, JSON.stringify(result));
```

## Advanced Use Cases

### 1. Document Search Engine
- Embed all documents once
- Store embeddings in vector database
- Query at runtime with new search terms

### 2. Content Recommendation
- Embed user preferences and content
- Find nearest neighbors
- Recommend high-similarity items

### 3. Clustering Analysis
- Generate embeddings for all content
- Use dimensionality reduction
- Identify natural groupings

### 4. Model Selection
- Embed sample data with multiple models
- Compare cluster quality
- Choose model with best separation

## Troubleshooting

### "No plot displayed"
- Check browser console for errors
- Verify embeddings have valid numbers
- Ensure at least 3 chunks

### "API error"
- Verify API keys are set correctly
- Check rate limits
- Ensure endpoint URLs are correct

### "Disconnected graph" warning
- Increase number of neighbors in Isomap
- Use PCA instead
- Add more data points

### "All points in one spot"
- Embeddings may be too similar
- Try different reduction technique
- Check if embeddings are normalized

## Next Steps

1. **Deploy API endpoints** to Vercel/Netlify
2. **Prepare your text chunks** (CSV, JSON, or database)
3. **Generate embeddings** for your content
4. **Visualize and analyze** clustering patterns
5. **Iterate on chunking strategy** based on results

## Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [Cohere Embed Documentation](https://docs.cohere.com/reference/embed)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
