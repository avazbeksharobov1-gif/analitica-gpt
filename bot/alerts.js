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

      if (thisWeek.revenue < lastWeek.revenue * 0.9) {
        const text = await aiInsight(lastWeek.revenue, thisWeek.revenue);

        const alerts = await prisma.alertSetting.findMany({
          where: { projectId: project.id, enabled: true }
        });

        const targets = alerts.length
          ? alerts.map(a => a.chatId)
          : ADMIN_IDS;

        for (const id of targets) {
          await bot.telegram.sendMessage(
            id,
            `?? <b>AI ALERT</b>\n\nДаромад пасайди!\n\n?? Сабаблар:\n${text}`,
            { parse_mode: 'HTML' }
          );
        }
      }
    } catch (e) {
      console.error('ALERT ERROR:', e.message);
    }
  });
}

module.exports = { setupAlerts };
