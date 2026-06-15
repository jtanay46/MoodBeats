exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const body = JSON.parse(event.body);
  const userMessage = body.messages[0].content;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a music composition AI. Always respond with a single valid JSON object only. No markdown, no backticks, no explanation — just the raw JSON.' }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const data = await response.json();
  console.log('Gemini raw:', JSON.stringify(data));

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Gemini text:', text);

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ content: [{ type: 'text', text }] })
  };
};
