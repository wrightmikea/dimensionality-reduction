// Ollama Embedding Manager - Local embedding generation
class OllamaEmbeddings {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  /**
   * Get available embedding models from Ollama
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();

      // Filter for embedding models
      const embeddingModels = data.models.filter(model =>
        model.name.includes('embed') ||
        model.name.includes('granite-embedding')
      );

      return embeddingModels.map(model => ({
        name: model.name,
        size: model.size,
        modified: model.modified_at
      }));
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }

  /**
   * Generate embedding for a single text
   */
  async embedSingle(text, model = 'nomic-embed-text') {
    const cacheKey = `${model}:${text}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data.embedding);
      return data.embedding;
    } catch (error) {
      console.error(`Failed to generate embedding for text:`, error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts with progress callback
   */
  async embedBatch(texts, model = 'nomic-embed-text', onProgress = null) {
    const embeddings = [];

    for (let i = 0; i < texts.length; i++) {
      const embedding = await this.embedSingle(texts[i], model);
      embeddings.push(embedding);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }
    }

    return embeddings;
  }

  /**
   * Get model info
   */
  async getModelInfo(modelName) {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: modelName
        })
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get model info:', error);
      return null;
    }
  }

  /**
   * Test Ollama connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}
