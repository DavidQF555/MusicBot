const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the queue'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		scheduler.shuffle();
		await interaction.reply(createSimpleSuccess('Shuffled the queue'));
	},
};