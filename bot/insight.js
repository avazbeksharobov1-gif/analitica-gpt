const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeDrop(prev, curr) {
  const prompt = `
Yesterday: ${prev}
Today: ${curr}
Why did revenue drop?
Give 3 reasons.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

module.exports = { analyzeDrop };
