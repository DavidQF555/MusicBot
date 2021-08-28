const { Client, Intents } = require('discord.js');

const config = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once('ready', () => {
	console.log('Ready!');
});

client.login(config.token);