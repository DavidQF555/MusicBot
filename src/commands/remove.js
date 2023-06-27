import { SlashCommandBuilder } from 'discord.js';
import { schedulers } from '../storage.js';
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
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		await interaction.deferReply({ ephemeral: true });
		const queue = scheduler.queue;
		const query = interaction.options.get('query').value.toLowerCase();
		for(let i = 0; i < queue.length; i++) {
			const track = queue[i];
			if(track.title.toLowerCase().includes(query)) {
				scheduler.remove(i);
				await interaction.followUp(createSimpleSuccess(`Removed [${track.title}](${track.url}) from the queue`));
				return;
			}
		}
		await interaction.followUp(createSimpleFailure(`Could not find \`${query}\` within the queue`));
	},
};