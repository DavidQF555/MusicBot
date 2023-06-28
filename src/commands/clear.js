import { SlashCommandBuilder } from 'discord.js';
import { clear } from '../data.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears the queue'),
	async execute(interaction) {
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		clear(interaction.guildId);
		await interaction.reply(createSimpleSuccess('Cleared the queue'));
	},
};