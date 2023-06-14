import { SlashCommandBuilder } from '@discordjs/builders';
import { schedulers } from '../audio/scheduler.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears the queue'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		scheduler.clear();
		await interaction.reply(createSimpleSuccess('Cleared the queue'));
	},
};