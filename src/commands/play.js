const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { AudioScheduler, schedulers } = require('../audio/scheduler.js');

const { GuildMember } = require('discord.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { searchTrack, createTrack } = require('../audio/track.js');
const getYouTubeID = require('get-youtube-id');

module.exports = {
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
		await interaction.deferReply();
		let scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				const channel = interaction.member.voice.channel;
				scheduler = new AudioScheduler(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					}),
				);
				scheduler.connection.on('error', console.warn);
				schedulers.set(interaction.guildId, scheduler);
			}
			else {
				await interaction.followUp(createSimpleFailure('You must be in a voice channel'));
				return;
			}
		}
		else if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.followUp(createSimpleFailure('Must be in the same channel'));
			return;
		}
		try {
			await entersState(scheduler.connection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (error) {
			console.warn(error);
			await interaction.followUp(createSimpleFailure('Failed to join voice channel within 20 seconds, please try again later!'));
			return;
		}
		const subcommand = interaction.options.getSubcommand();
		try {
			let track;
			if(subcommand == 'url') {
				const id = getYouTubeID(interaction.options.getString('url', true));
				if(id) {
					track = await createTrack(id, interaction.channel);
				}
				else {
					await interaction.followUp(createSimpleFailure('Could not process URL'));
					return;
				}
			}
			else {
				track = await searchTrack(interaction.options.getString('query'), interaction.channel);
			}
			await scheduler.enqueue(track);
			await interaction.followUp(createSimpleSuccess(`Enqueued [${track.title}](${track.url})`));
		}
		catch (error) {
			console.warn(error);
			await interaction.followUp(createSimpleFailure('Failed to play track, please try again later!'));
		}
	},
};