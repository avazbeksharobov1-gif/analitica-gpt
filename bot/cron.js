const cron = require('node-cron');
const { getKpi } = require('../services/analytics');

module.exports = function setupCron(bot, ADMIN_IDS = []) {
  cron.schedule('0 5 * * *', async () => {
    const today = new Date();
    const s = await getKpi(1, today, today);
    for (const id of ADMIN_IDS) {
      await bot.telegram.sendMessage(
        id,
        `Daily report (05:00)\n\n` +
          `Revenue: ${s.revenue}\n` +
          `Orders: ${s.orders}\n` +
          `Fees: ${s.fees}\n` +
          `Acquiring: ${s.acquiring}\n` +
          `Logistics: ${s.logistics}\n` +
          `Returns: ${s.returns}\n` +
          `Expenses: ${s.expenses}\n` +
          `COGS: ${s.cogs}\n` +
          `Profit: ${s.profit}`
      );
    }
  });
};
