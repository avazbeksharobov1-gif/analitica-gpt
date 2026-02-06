require('dotenv').config();
const express = require('express');
const path = require('path');
const { setupAlerts } = require('./bot/alerts');
const { ensureCategories, ensureProject } = require('./services/bootstrap');

const bot = require('./bot');
const dashboard = require('./web/dashboard');
const admin = require('./web/admin');
const api = require('./web/api');

const app = express();
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(',').map(String)
  : [];

setupAlerts(bot, ADMIN_IDS);

/* EXPRESS */
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* WEB */
dashboard(app);
admin(app);
api(app);

/* TELEGRAM WEBHOOK */
app.post('/telegram', (req, res) => {
  bot.handleUpdate(req.body, res);
});

/* START */
app.listen(PORT, async () => {
  await ensureCategories();
  await ensureProject();
  console.log('Server running on', PORT);
  if (WEBHOOK_URL) {
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/telegram`);
    console.log('Webhook connected');
  } else {
    console.warn('WEBHOOK_URL is not set; webhook not configured');
  }
});
