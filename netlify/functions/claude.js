exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const body = JSON.parse(event.body);
  const userMessage = body.messages[0].content;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://moodbeats12.netlify.app',
      'X-Title': 'MoodBeats'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 1000
    })
  });

  const raw = await response.text();
  console.log('STATUS:', response.status);
  console.log('RAW BODY:', raw);

  let text = '';
  try {
    const data = JSON.parse(raw);
    text = data.choices?.[0]?.message?.content || data.error?.message || JSON.stringify(data);
  } catch(e) {
    text = raw;
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ content: [{ type: 'text', text }] })
  };
};
