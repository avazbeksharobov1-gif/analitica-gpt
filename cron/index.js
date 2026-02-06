const cron = require('node-cron');
const { getStats, getCompareStats } = require('../services/yandex');

/**
 * CRON setup
 * @param {Telegraf} bot
 */
function setupCron(bot) {
  const ADMIN_IDS = process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(',').map(String)
    : [];

  if (!ADMIN_IDS.length) {
    console.warn('⚠️ ADMIN_IDS йўқ — cron хабар юборилмайди');
  }

  /* ================= 05:00 AUTO REPORT ================= */
  cron.schedule('0 5 * * *', async () => {
    try {
      const s = await getStats();

      for (const id of ADMIN_IDS) {
        await bot.telegram.sendMessage(
          id,
          `⏰ <b>Кунлик авто ҳисобот (05:00)</b>\n\n` +
          `💰 Даромад: <b>${s.revenue}</b>\n` +
          `📦 Буюртма: <b>${s.orders}</b>\n` +
          `📢 Реклама: <b>${s.ads}</b>`,
          { parse_mode: 'HTML' }
        );
      }

      console.log('✅ 05:00 авто ҳисобот юборилди');
    } catch (e) {
      console.error('❌ CRON 05:00 хато:', e.message);
    }
  });

  /* ================= REVENUE DROP ALERT ================= */
  cron.schedule('*/30 * * * *', async () => {
    try {
      const { thisWeek, lastWeek } = await getCompareStats();

      if (lastWeek.revenue === 0) return;

      const drop =
        ((thisWeek.revenue - lastWeek.revenue) / lastWeek.revenue) * 100;

      if (drop <= -10) {
        for (const id of ADMIN_IDS) {
          await bot.telegram.sendMessage(
            id,
            `⚠️ <b>Огоҳлантириш!</b>\n\n` +
            `Даромад <b>${Math.abs(drop).toFixed(1)}%</b> га пасайди!\n\n` +
            `📉 Олдин: ${lastWeek.revenue}\n` +
            `📊 Ҳозир: ${thisWeek.revenue}`,
            { parse_mode: 'HTML' }
          );
        }

        console.log('⚠️ Revenue drop alert юборилди');
      }
    } catch (e) {
      console.error('❌ CRON alert хато:', e.message);
    }
  });
}

module.exports = { setupCron };
