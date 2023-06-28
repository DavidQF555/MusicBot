import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import { enterChannel } from '../audio/scheduler.js';

export default {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Joins the current voice channel'),
	async execute(interaction) {
		if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
			await interaction.deferReply({ ephemeral: true });
			const scheduler = await enterChannel(interaction.member.voice.channel);
			if(!scheduler) {
				await interaction.followUp(createSimpleFailure('Failed to join voice channel in time, please try again later!'));
				return;
			}
			await interaction.followUp(createSimpleSuccess('Successfully joined channel'));
			await scheduler.processQueue();
		}
		else {
			await interaction.reply(createSimpleFailure('You must be in a voice channel'));
		}
	},
};