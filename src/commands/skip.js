import { SlashCommandBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { schedulers } from '../data.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song'),
	async execute(interaction) {
		const scheduler = schedulers[interaction.guildId];
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Not currently playing'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		if(!scheduler.hasNextTrack() && scheduler.player.state.status === AudioPlayerStatus.Idle) {
			await interaction.reply(createSimpleFailure('At the end of the queue'));
			return;
		}
		const skipped = scheduler.skip();
		await interaction.reply(createSimpleSuccess(`Skipping [${skipped.title}](${skipped.url})`));
	},
};