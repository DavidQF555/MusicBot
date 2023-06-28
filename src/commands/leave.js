import { SlashCommandBuilder } from 'discord.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import { getVoiceConnection } from '@discordjs/voice';

export default {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Tells bot to leave current channel'),
	async execute(interaction) {
		const connection = getVoiceConnection(interaction.guildId);
		if(!connection) {
			await interaction.reply(createSimpleFailure('I am not currently in a channel'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		connection.destroy();
		await interaction.reply(createSimpleSuccess('Successfully left the channel'));
	},
};