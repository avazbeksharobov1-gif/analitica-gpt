const cron = require('node-cron');
const { getKpi } = require('../services/analytics');

module.exports = function setupCron(bot, ADMIN_IDS = []) {
  cron.schedule('0 5 * * *', async () => {
    const today = new Date();
    const s = await getKpi(1, today, today);
    for (const id of ADMIN_IDS) {
      await bot.telegram.sendMessage(
        id,
        `? <b>Avto hisobot / Авто отчёт</b>\n\n` +
        `Daromad / Доход: ${s.revenue}\n` +
        `Buyurtmalar / Заказы: ${s.orders}\n` +
        `Harajat / Расходы: ${s.expenses}\n` +
        `Foyda / Прибыль: ${s.profit}`,
        { parse_mode: 'HTML' }
      );
    }
  });
};
