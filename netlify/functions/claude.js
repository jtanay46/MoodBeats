exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const body = JSON.parse(event.body);
  const userMessage = body.messages[0].content;
  const apiKey = process.env.ANTHROPIC_API_KEY; // we'll reuse same env var name

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 1, maxOutputTokens: 1000 }
      })
    }
  );

  const data = await response.json();
  console.log('Gemini response:', JSON.stringify(data));

  // Convert Gemini response format to Anthropic-like format so frontend works unchanged
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ content: [{ type: 'text', text }] })
  };
};
