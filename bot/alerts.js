const cron = require('node-cron');
const { prisma } = require('../services/db');
const { getCompareStats } = require('../services/analytics');
const { aiInsight } = require('../services/ai');

function setupAlerts(bot, ADMIN_IDS = []) {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const project = await prisma.project.findFirst({ orderBy: { id: 'asc' } });
      if (!project) return;

      const { thisWeek, lastWeek } = await getCompareStats(project.id);
      if (lastWeek.profit === 0) return;

      if (thisWeek.profit < lastWeek.profit * 0.9) {
        const text = await aiInsight(lastWeek.revenue, thisWeek.revenue);
        const alerts = await prisma.alertSetting.findMany({
          where: { projectId: project.id, enabled: true }
        });

        const targets = alerts.length ? alerts.map(a => a.chatId) : ADMIN_IDS;
        const msg =
          `AI ALERT\n\nProfit dropped!\n\n` +
          `Profit last week: ${lastWeek.profit}\n` +
          `Profit this week: ${thisWeek.profit}\n` +
          `Revenue last week: ${lastWeek.revenue}\n` +
          `Revenue this week: ${thisWeek.revenue}\n\n` +
          `AI insight:\n${text}`;

        for (const id of targets) {
          await bot.telegram.sendMessage(id, msg);
        }
      }
    } catch (e) {
      console.error('ALERT ERROR:', e.message);
    }
  });
}

module.exports = { setupAlerts };
