const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function aiInsight(prev, curr) {
  const prompt = `
Previous revenue: ${prev}
Current revenue: ${curr}

Explain why revenue dropped.
Give 3 short reasons and 2 actions.
Answer in Uzbek (Cyrillic) and Russian.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

async function aiRecommend(stats) {
  const prompt = `
Revenue: ${stats.revenue}
Orders: ${stats.orders}
Fees: ${stats.fees}
Logistics: ${stats.logistics}
Returns: ${stats.returns}
Expenses: ${stats.expenses}
COGS: ${stats.cogs}
Profit: ${stats.profit}

Give:
1) Marketing recommendations
2) Pricing recommendations
3) Quick improvements
Short bullet points.
Answer in Uzbek (Cyrillic) and Russian.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

async function aiAnomalyDetect(series) {
  const prompt = `
Series: ${JSON.stringify(series)}

Detect anomalies. Return short bullet points with dates/indexes and reason.
Answer in Uzbek (Cyrillic) and Russian.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

async function aiProductProfit(items) {
  const prompt = `
Product profit list (JSON): ${JSON.stringify(items)}

Analyze which products are profitable and which are loss-making.
Give 3-5 key insights and actions.
Answer in Uzbek (Cyrillic) and Russian.
`;

  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  return r.choices[0].message.content;
}

module.exports = { aiRecommend, aiInsight, aiAnomalyDetect, aiProductProfit };
