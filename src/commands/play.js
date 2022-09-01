const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { AudioScheduler, schedulers } = require('../audio/scheduler.js');

const { GuildMember } = require('discord.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { createTrack } = require('../audio/track.js');

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