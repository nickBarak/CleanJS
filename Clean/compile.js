const { compile } = require('../Clean');
const { join } = require('path');

compile(__dirname, '../texts', join(__dirname, 'app.js'));