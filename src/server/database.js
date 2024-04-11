const jsYaml = require('js-yaml');
const fs = require('fs');
const file = fs.readFileSync('../../db_config.yaml', 'utf8');
const dbConfig = jsYaml.load(file);
const db_url = `${dbConfig.db.type}://${dbConfig.db.host}:${dbConfig.db.port}/chatting_room`
module.exports = {db_url}