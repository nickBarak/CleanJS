const { compile } = require('../Clean');
const { join } = require('path');

compile(join(__dirname, '../texts'), join(__dirname, 'app.js'));