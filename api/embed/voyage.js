// Example API endpoint for Voyage AI embeddings

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, texts } = req.body;

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Voyage API key not configured' });
    }

    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'voyage-2',
        input: texts
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message });
    }

    const data = await response.json();
    const embeddings = data.data.map(item => item.embedding);

    return res.status(200).json({
      embeddings,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Voyage embedding error:', error);
    return res.status(500).json({ error: 'Failed to generate embeddings' });
  }
}

export const config = {
  maxDuration: 60,
  runtime: 'nodejs18.x'
};
