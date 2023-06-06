const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Tells bot to leave current channel'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('I am not currently in a channel'));
			return;
		}
		scheduler.connection.destroy();
		await interaction.reply(createSimpleSuccess('Successfully left the channel'));
	},
};