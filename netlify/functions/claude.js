exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const body = JSON.parse(event.body);
  const userMessage = body.messages[0].content;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Try models in order until one works
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.0-pro'];
  
  let text = '';
  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1000 }
        })
      }
    );
    const data = await response.json();
    console.log(`${model} response:`, JSON.stringify(data).slice(0, 300));
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text) break;
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ content: [{ type: 'text', text }] })
  };
};
