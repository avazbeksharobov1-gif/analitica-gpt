const { Telegraf } = require('telegraf');
const setupCommands = require('./commands');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('ping', (ctx) => {
  ctx.reply('pong');
});

setupCommands(bot);

bot.catch((err) => {
  console.error('BOT ERROR:', err);
});

module.exports = bot;
