import { SlashCommandBuilder } from 'discord.js';
import { remove } from '../data.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';

export default {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a track from the queue')
		.addStringOption(builder =>
			builder.setName('query')
				.setDescription('Query to search for in the queue')
				.setRequired(true),
		),
	async execute(interaction) {
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		await interaction.deferReply({ ephemeral: true });
		const query = interaction.options.get('query').value.toLowerCase();
		const track = remove(interaction.guildId, query);
		if(track) {
			await interaction.followUp(createSimpleSuccess(`Removed [${track.title}](${track.url}) from the queue`));
			return;
		}
		await interaction.followUp(createSimpleFailure(`Could not find \`${query}\` within the queue`));
	},
};