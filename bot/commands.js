const { getKpi, getCompareStats, getForecastCompare, listProjects, addExpense } = require('../services/analytics');
const { aiInsight, aiRecommend } = require('../services/ai');
const { prisma } = require('../services/db');

const projectByChat = new Map();

const CATEGORY_ALIASES = {
  'свет': 'svet',
  'газ': 'gaz',
  'сув': 'suv',
  'озик': 'ozik',
  'ози?': 'ozik',
  'овкат': 'ozik',
  'ов?ат': 'ozik',
  'мошина': 'moshina',
  'солик': 'soliq',
  'соли?': 'soliq',
  'квартплата': 'kvartp'
};

function parseExpense(text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const [, categoryRaw, amountStr, ...noteParts] = parts;
  const amount = Number(amountStr);
  if (!categoryRaw || Number.isNaN(amount)) return null;
  const category = CATEGORY_ALIASES[categoryRaw.toLowerCase()] || categoryRaw.toLowerCase();
  return { category, amount, note: noteParts.join(' ') || null };
}

async function getOrCreateProject() {
  const existing = await prisma.project.findFirst({ orderBy: { id: 'asc' } });
  if (existing) return existing;
  return prisma.project.create({ data: { name: 'Main Project' } });
}

function getProjectId(ctx) {
  return projectByChat.get(String(ctx.chat.id)) || 1;
}

function setupCommands(bot) {
  bot.start(async (ctx) => {
    const p = await getOrCreateProject();
    projectByChat.set(String(ctx.chat.id), p.id);
    ctx.reply(
      'Analitica GPT\n\n' +
      '/stats - Hisobot / Отчёт\n' +
      '/compare - Taqqoslash / Сравнение\n' +
      '/forecast - 30 kun prognoz / Прогноз 30 дней\n' +
      '/insight - AI tahlil / AI анализ\n' +
      '/recommend - AI tavsiyalar / AI рекомендации\n' +
      '/projects - Loyihalar / Проекты\n' +
      '/project <id> - Tanlash / Выбор\n' +
      '/alerts on|off - Alert yoq/ochir\n' +
      'Харажат: харжат свет 150000'
    );
  });

  bot.command('project', async (ctx) => {
    const parts = ctx.message.text.trim().split(/\s+/);
    const id = Number(parts[1]);
    if (!id) {
      ctx.reply('Формат: /project 1');
      return;
    }
    const p = await prisma.project.findUnique({ where: { id } });
    if (!p) {
      ctx.reply('Проект топилмади');
      return;
    }
    projectByChat.set(String(ctx.chat.id), p.id);
    ctx.reply(`Танланди: ${p.name}`);
  });

  bot.command('stats', async (ctx) => {
    const projectId = getProjectId(ctx);
    const today = new Date();
    const s = await getKpi(projectId, today, today);
    ctx.reply(
      `Hisobot / Отчёт\n\n` +
      `Daromad / Доход: ${s.revenue}\n` +
      `Buyurtmalar / Заказы: ${s.orders}\n` +
      `Harajat / Расходы: ${s.expenses}\n` +
      `Foyda / Прибыль: ${s.profit}`
    );
  });

  bot.command('compare', async (ctx) => {
    const projectId = getProjectId(ctx);
    const { thisWeek, lastWeek } = await getCompareStats(projectId);
    ctx.reply(
      `Taqqoslash / Сравнение\n\n` +
      `Bu hafta / Эта неделя: ${thisWeek.revenue}\n` +
      `O‘tgan hafta / Прошлая неделя: ${lastWeek.revenue}`
    );
  });

  bot.command('forecast', async (ctx) => {
    const projectId = getProjectId(ctx);
    const f = await getForecastCompare(projectId);
    const today = f.current[0] ?? 0;
    const day30 = f.current[f.current.length - 1] ?? 0;
    ctx.reply(
      `30 kun prognoz / Прогноз 30 дней\n\n` +
      `Bugun / Сегодня: ${today}\n` +
      `30 kundan keyin / Через 30 дней: ${day30}`
    );
  });

  bot.command('insight', async (ctx) => {
    const projectId = getProjectId(ctx);
    const { thisWeek, lastWeek } = await getCompareStats(projectId);
    const text = await aiInsight(lastWeek.revenue, thisWeek.revenue);
    ctx.reply(`AI tahlil / AI анализ\n\n${text}`);
  });

  bot.command('recommend', async (ctx) => {
    try {
      const projectId = getProjectId(ctx);
      const today = new Date();
      const text = await aiRecommend(await getKpi(projectId, today, today));
      ctx.reply(`AI tavsiyalar / AI рекомендации\n\n${text}`);
    } catch (e) {
      ctx.reply('AI tavsiyalar mavjud emas / AI рекомендации недоступны');
    }
  });

  bot.command('projects', async (ctx) => {
    const list = await listProjects();
    const text = list.map(p => `${p.id}. ${p.name}`).join('\n') || 'Bo\'sh / Пусто';
    ctx.reply(`Loyihalar / Проекты\n\n${text}`);
  });

  bot.command('alerts', async (ctx) => {
    const on = ctx.message.text.includes('on');
    const projectId = getProjectId(ctx);
    const chatId = String(ctx.chat.id);
    await prisma.alertSetting.upsert({
      where: { projectId_chatId: { projectId, chatId } },
      update: { enabled: on },
      create: { projectId, chatId, enabled: on }
    });
    ctx.reply(on ? 'Alert yoqildi' : 'Alert o‘chirildi');
  });

  bot.hears(/^(harajat|харжат)\s+/i, async (ctx) => {
    try {
      const projectId = getProjectId(ctx);
      const parsed = parseExpense(ctx.message.text);
      if (!parsed) {
        ctx.reply('Формат: харжат свет 150000');
        return;
      }
      await addExpense(projectId, parsed.category, parsed.amount, parsed.note);
      ctx.reply('?ўшилди');
    } catch (e) {
      ctx.reply('Харажат ?ўшилмади');
    }
  });
}

module.exports = setupCommands;
