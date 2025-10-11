// Example API endpoint for OpenAI embeddings
// Deploy this as a serverless function (Vercel, Netlify, etc.)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, texts } = req.body;

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Invalid input: texts must be a non-empty array' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();

    // Extract embeddings
    const embeddings = data.data
      .sort((a, b) => a.index - b.index)
      .map(item => item.embedding);

    return res.status(200).json({
      embeddings,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Embedding error:', error);
    return res.status(500).json({ error: 'Failed to generate embeddings' });
  }
}

// Configuration for serverless deployment
export const config = {
  maxDuration: 60, // 60 seconds timeout
  runtime: 'nodejs18.x'
};
