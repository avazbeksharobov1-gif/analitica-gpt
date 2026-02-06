const path = require('path');

module.exports = (app) => {
  app.get('/admin', async (_, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
  });
};
