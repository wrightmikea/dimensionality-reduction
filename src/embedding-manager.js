// Embedding Manager - handles multiple embedding providers
class EmbeddingManager {
  constructor() {
    this.cache = new Map();
    this.providers = {
      'openai-small': {
        model: 'text-embedding-3-small',
        dims: 1536,
        endpoint: '/api/embed/openai'
      },
      'openai-large': {
        model: 'text-embedding-3-large',
        dims: 3072,
        endpoint: '/api/embed/openai'
      },
      'voyage-2': {
        model: 'voyage-2',
        dims: 1024,
        endpoint: '/api/embed/voyage'
      },
      'cohere-v3': {
        model: 'embed-english-v3.0',
        dims: 1024,
        endpoint: '/api/embed/cohere'
      }
    };
  }

  /**
   * Generate embeddings for text chunks using specified model
   * @param {string[]} chunks - Array of text chunks
   * @param {string} modelKey - Key from this.providers
   * @returns {Promise<{embeddings: number[][], chunks: string[], model: string}>}
   */
  async generateEmbeddings(chunks, modelKey) {
    const cacheKey = `${modelKey}:${JSON.stringify(chunks)}`;

    if (this.cache.has(cacheKey)) {
      console.log('Using cached embeddings');
      return this.cache.get(cacheKey);
    }

    const provider = this.providers[modelKey];
    if (!provider) {
      throw new Error(`Unknown model: ${modelKey}`);
    }

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        texts: chunks
      })
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = {
      embeddings: data.embeddings,
      chunks: chunks,
      model: modelKey,
      dims: provider.dims
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Compute cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  /**
   * Find nearest chunks to a query
   * @param {number[]} queryEmbedding - Query vector
   * @param {number[][]} embeddings - Chunk embeddings
   * @param {number} topK - Number of results
   * @returns {Array<{idx: number, similarity: number}>}
   */
  findNearest(queryEmbedding, embeddings, topK = 10) {
    const similarities = embeddings.map((emb, idx) => ({
      idx,
      similarity: this.cosineSimilarity(queryEmbedding, emb)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  /**
   * Save embeddings to localStorage
   */
  saveToStorage(key, data) {
    localStorage.setItem(`embeddings:${key}`, JSON.stringify(data));
  }

  /**
   * Load embeddings from localStorage
   */
  loadFromStorage(key) {
    const data = localStorage.getItem(`embeddings:${key}`);
    return data ? JSON.parse(data) : null;
  }
}
