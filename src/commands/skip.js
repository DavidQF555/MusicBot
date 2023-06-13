const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		if(!scheduler.hasNextTrack() && scheduler.player.state.status === AudioPlayerStatus.Idle && !scheduler.queueLock) {
			await interaction.reply(createSimpleFailure('At the end of the queue'));
			return;
		}
		const skipped = scheduler.skip();
		await interaction.reply(createSimpleSuccess(`Skipping [${skipped.title}](${skipped.url})`));
	},
};