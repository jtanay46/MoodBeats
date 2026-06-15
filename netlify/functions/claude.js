exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const body = JSON.parse(event.body);
  const userMessage = body.messages[0].content;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const models = [
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-3-4b-it:free',
    'qwen/qwen-2.5-7b-instruct:free'
  ];

  let text = '';
  for (const model of models) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://moodbeats12.netlify.app',
        'X-Title': 'MoodBeats'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 1000
      })
    });

    const raw = await response.text();
    console.log(`${model} raw:`, raw.slice(0, 300));
    try {
      const data = JSON.parse(raw);
      text = data.choices?.[0]?.message?.content || '';
      if (text) { console.log('Success with', model); break; }
    } catch(e) {}
  }

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ content: [{ type: 'text', text }] })
  };
};
