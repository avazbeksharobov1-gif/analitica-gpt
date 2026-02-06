const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function aiInsight(prev, curr) {
  const prompt = `
Previous revenue: ${prev.revenue}
Current revenue: ${curr.revenue}

Explain why revenue dropped and give advice.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

module.exports = { aiInsight };


