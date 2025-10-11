# Using This Tool with Real Embeddings - Quick Answers

## Your Questions Answered

### 1. How can we leverage this to view actual embeddings using different embedding models?

**Short Answer**: Use `index_embeddings.html` - it now supports multiple embedding models!

**Implementation**:
```javascript
// The tool now supports:
- OpenAI (text-embedding-3-small, text-embedding-3-large)
- Voyage AI (voyage-2, voyage-large-2)
- Cohere (embed-english-v3.0)
- Any custom model via API endpoint
```

**How it works**:
1. Input your text chunks (paste or upload file)
2. Select embedding model from dropdown
3. Click "Generate Embeddings & Visualize"
4. The tool:
   - Sends chunks to API endpoint
   - Receives high-dimensional vectors (768d-3072d)
   - Applies PCA or Isomap to reduce to 3D
   - Displays interactive 3D plot

**Setup Required**:
```bash
# Option 1: Deploy serverless (recommended)
vercel deploy
vercel env add OPENAI_API_KEY

# Option 2: Local dev server
npm run dev
# Access at http://localhost:4444/index_embeddings.html
```

---

### 2. These have a lot more than 10 dimensions. How do we handle that?

**Short Answer**: The algorithms already handle this! Just pass in your embeddings.

**Technical Details**:

The existing algorithms work with ANY dimension:
```javascript
// Works with 10D (demo data)
pca(data10D, 3);

// Works with 768D (BERT embeddings)
pca(data768D, 3);

// Works with 3072D (OpenAI large)
pca(data3072D, 3);
```

**Performance Considerations**:

| Dimensions | Points | PCA Time | Isomap Time |
|-----------|--------|----------|-------------|
| 10        | 240    | ~10ms    | ~500ms      |
| 768       | 240    | ~50ms    | ~2s         |
| 1536      | 240    | ~100ms   | ~4s         |
| 3072      | 240    | ~200ms   | ~8s         |

**Best Practices**:
- Use PCA for large dimensions (faster)
- Use Isomap for non-linear manifolds (slower but better quality)
- Consider pre-reducing dimensions: 3072d → 128d → 3d

**Example Code**:
```javascript
// Two-stage reduction for very high dimensions
const intermediate = pca(embeddings3072D, 128);  // Fast pre-reduction
const final = isomap(intermediate, 3, 12);       // Quality final reduction
```

---

### 3. How can we show which chunk is closest to a query string?

**Short Answer**: Use the Query Search feature in `index_embeddings.html`!

**How to Use**:
1. Generate embeddings for your chunks
2. Enter a search query in the "Search Query" box
3. Adjust "Top K Results" slider (default 10)
4. Click "Highlight Similar Chunks"

**What Happens**:
```
Query: "machine learning algorithms"
  ↓
Query Embedding: [0.23, -0.45, 0.12, ...]
  ↓
Cosine Similarity: Compare to all chunk embeddings
  ↓
Ranking: Sort by similarity score
  ↓
Visualization:
  🔴 Top 10 = Large red points (most similar)
  ⚪ Others = Small gray points (less similar)
```

**Visual Encoding**:
- **Color**: Red = similar, Gray = dissimilar
- **Size**: Larger = higher similarity
- **Opacity**: Brighter = more relevant
- **Hover**: Shows chunk text + similarity score

**Code Behind the Scenes**:
```javascript
// Implemented in src/embedding-manager.js
findNearest(queryEmbedding, embeddings, topK = 10) {
  const similarities = embeddings.map((emb, idx) => ({
    idx,
    similarity: this.cosineSimilarity(queryEmbedding, emb)
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, topK);
}

cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

---

### 4. How can we see different clustering of chunks using different embeddings?

**Short Answer**: Use `index_comparison.html` - it shows side-by-side comparisons!

**What It Does**:
- Generates embeddings with multiple models for the SAME chunks
- Shows side-by-side 3D plots
- Uses consistent colors: same chunk = same color across all models
- Easy visual comparison of clustering patterns

**Workflow**:
```
Same 20 Text Chunks
        ↓
   Generate with 4 models:
        ↓
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  OpenAI Small  │  OpenAI Large  │   Voyage-2     │   Cohere v3    │
│   (1536d)      │   (3072d)      │   (1024d)      │   (1024d)      │
├────────────────┼────────────────┼────────────────┼────────────────┤
│   🔴 🔵 🟢     │   🔴 🔵 🟢     │   🔴 🔵 🟢     │   🔴 🔵 🟢     │
│  Tight         │   Tighter      │   Scattered    │   Mixed        │
│  clusters      │   clusters     │   clusters     │   clusters     │
└────────────────┴────────────────┴────────────────┴────────────────┘
         ↓              ↓               ↓               ↓
   Analysis: Compare patterns to choose best model
```

**What to Look For**:

1. **Cluster Tightness**:
   - Tight clusters = Model understands that category well
   - Scattered points = Model struggles with those concepts

2. **Cluster Separation**:
   - Far apart = Good semantic distinction
   - Overlapping = Model conflates those topics

3. **Pattern Similarity**:
   - Similar patterns = Models have similar understanding
   - Different patterns = Models focus on different features

**Example Analysis**:

Imagine you have chunks about:
- 🤖 Machine Learning
- 🌳 Nature descriptions
- 💻 Programming tutorials
- 🧬 Biology concepts

**Good Model** (OpenAI Large):
```
       🤖 🤖 🤖           Clear separation

🌳 🌳 🌳           💻 💻 💻

              🧬 🧬 🧬
```

**Poor Model** (Hypothetical):
```
  🤖 🌳    💻
🧬   🤖  💻   🌳    All mixed together
  💻  🧬   🤖  🌳
```

**Interpretation**:
- Choose the model with best separation for YOUR content
- Models that work well for general text may not work for domain-specific content

---

## Quick Start Checklist

- [ ] **Try demo mode first**:
  ```bash
  npm run dev
  # Open http://localhost:4444/index_embeddings.html
  # Select "Demo Mode" and click "Generate"
  ```

- [ ] **Deploy API endpoints**:
  ```bash
  vercel deploy
  vercel env add OPENAI_API_KEY your-key
  ```

- [ ] **Prepare your data**:
  - JSON: `{"chunks": ["text1", "text2", ...]}`
  - CSV: One chunk per line
  - Or paste directly into textarea

- [ ] **Generate embeddings**:
  - Select your preferred model
  - Choose reduction technique (PCA = fast, Isomap = quality)
  - Click "Generate Embeddings & Visualize"

- [ ] **Test query search**:
  - Enter relevant query
  - Adjust top-K slider
  - Click "Highlight Similar Chunks"
  - Observe which chunks are highlighted

- [ ] **Compare models** (optional):
  - Open `index_comparison.html`
  - Select 2-4 models
  - Click "Generate Comparison"
  - Analyze clustering differences

---

## Real-World Example

**Scenario**: You have 500 customer support tickets and want to understand topic clusters.

**Step 1**: Prepare data
```json
{
  "chunks": [
    "My password reset email never arrived",
    "Cannot log in to my account",
    "How do I update my billing information?",
    "Product delivery is delayed",
    ...
  ]
}
```

**Step 2**: Generate embeddings
- Model: `openai-small` (good balance of quality/cost)
- Technique: `PCA` (fast for 500 chunks)

**Step 3**: Analyze clusters
- Look for natural groupings
- Common clusters might be:
  - 🔑 Authentication issues
  - 💳 Billing questions
  - 📦 Shipping problems
  - 🐛 Bug reports

**Step 4**: Use query search
- Query: "payment declined"
- Top-K: 20
- Find all similar payment-related tickets

**Step 5**: Compare models (optional)
- Try `voyage-2` and `cohere-v3`
- Choose model that best separates your categories

---

## Performance Tips

1. **Cache embeddings**: They're expensive to generate!
   ```javascript
   localStorage.setItem('embeddings-v1', JSON.stringify(embeddings));
   ```

2. **Batch processing**: Send 100 chunks at once, not 1 at a time

3. **Use smaller models first**: Test with 3-small before 3-large

4. **Pre-filter data**: Remove duplicates and very short chunks

5. **Monitor costs**: Track API usage to avoid surprises

---

## Need Help?

- **Demo not working?**: Check console (F12) for errors
- **API errors?**: Verify environment variables are set
- **Poor clustering?**: Try different models or adjust chunk size
- **Too slow?**: Use PCA instead of Isomap, or reduce data points

See `EMBEDDING_GUIDE.md` for detailed documentation!
