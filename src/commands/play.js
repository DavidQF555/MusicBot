import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { enterChannel } from '../audio/scheduler.js';
import { schedulers } from '../data.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import { searchTrack, createTrack } from '../audio/track.js';
import getYouTubeID from 'get-youtube-id';

export default {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Queues a song')
		.addSubcommand(builder =>
			builder.setName('search')
				.setDescription('Searches for audio from YouTube')
				.addStringOption(b =>
					b.setName('query')
						.setDescription('Query to search on Youtube')
						.setRequired(true),
				),
		)
		.addSubcommand(builder =>
			builder.setName('url')
				.setDescription('Plays audio from a YouTube URL')
				.addStringOption(b =>
					b.setName('url')
						.setDescription('URL to play')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		let scheduler;
		await interaction.deferReply({ ephemeral: true });
		if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
			scheduler = schedulers[interaction.guildId];
			if(!scheduler || interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
				scheduler = await enterChannel(interaction.member.voice.channel);
				if(!scheduler) {
					await interaction.followUp(createSimpleFailure('Failed to join voice channel in time, please try again later!'));
					return;
				}
				scheduler.index = scheduler.queue.length - 1;
			}
		}
		else {
			await interaction.followUp(createSimpleFailure('You must be in a voice channel'));
			return;
		}
		const subcommand = interaction.options.getSubcommand();
		let track;
		if(subcommand == 'url') {
			const id = getYouTubeID(interaction.options.getString('url', true));
			if(id) {
				track = await createTrack(id);
			}
			else {
				await interaction.followUp(createSimpleFailure('Could not process URL'));
				return;
			}
		}
		else {
			track = await searchTrack(interaction.options.getString('query'));
		}
		scheduler.channel = interaction.channel;
		await scheduler.enqueue(track);
		await interaction.followUp(createSimpleSuccess(`Enqueued [${track.title}](${track.url})`));
	},
};