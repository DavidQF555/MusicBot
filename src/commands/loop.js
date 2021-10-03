const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggles whether the queue loops'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		await interaction.deferReply();
		await scheduler.loop();
		if(scheduler.loop) {
			await interaction.followUp(createSimpleSuccess('Now looping'));
		}
		else {
			await interaction.followUp(createSimpleSuccess('No longer looping'));
		}
	},
};