import { SlashCommandBuilder } from 'discord.js';
import { shuffle } from '../storage.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the queue'),
	async execute(interaction) {
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		shuffle(interaction.guildId);
		await interaction.reply(createSimpleSuccess('Shuffled the queue'));
	},
};