const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const https = require('https');
const { AudioTrack, AudioScheduler, schedulers } = require('../audio.js');
const { GuildMember } = require('discord.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Queues a song')
		.addStringOption(builder =>
			builder.setName('query')
				.setDescription('Query to search on Youtube')
				.setRequired(true),
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
		try {
			await entersState(scheduler.connection, VoiceConnectionStatus.Ready, 20e3);
		}
		catch (error) {
			console.warn(error);
			await interaction.followUp(createSimpleFailure('Failed to join voice channel within 20 seconds, please try again later!'));
			return;
		}

		try {
			const track = await createTrack(interaction.options.get('query').value, interaction.channel);
			await scheduler.enqueue(track);
			await interaction.followUp(createSimpleSuccess(`Enqueued [${track.title}](${track.url})`));
		}
		catch (error) {
			console.warn(error);
			await interaction.followUp(createSimpleFailure('Failed to play track, please try again later!'));
		}
	},
};

async function createTrack(query, channel) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&key=${process.env.YT_DATA_KEY}`;
	return new Promise((resolve, reject) => {
		https.get(url, res => {
			res.setEncoding('utf-8');
			let body = '';
			res.on('data', data => {
				body += data;
			});
			res.on('end', () => {
				try {
					const video = JSON.parse(body).items[0];
					resolve(new AudioTrack(video.snippet.title, `https://www.youtube.com/watch?v=${video.id.videoId}`, channel));
				}
				catch (error) {
					reject(error);
				}
			});

		}).on('error', error => {
			reject(error);
		});
	},
	);
}
