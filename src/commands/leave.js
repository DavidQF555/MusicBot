import { SlashCommandBuilder } from 'discord.js';
import { schedulers } from '../audio/scheduler.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Tells bot to leave current channel'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('I am not currently in a channel'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		scheduler.connection.destroy();
		await interaction.reply(createSimpleSuccess('Successfully left the channel'));
	},
};