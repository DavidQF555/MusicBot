const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song'),
	async execute(interaction) {
		await interaction.deferReply();
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.followUp(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		else if(!scheduler.hasNextTrack() && scheduler.player.state.status === AudioPlayerStatus.Idle && !scheduler.queueLock) {
			await interaction.followUp(createSimpleFailure('At the end of the queue'));
			return;
		}
		const skipped = scheduler.skip();
		await interaction.followUp(createSimpleSuccess(`Skipping [${skipped.title}](${skipped.url})`));
	},
};