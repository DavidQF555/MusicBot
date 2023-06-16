import { SlashCommandBuilder } from 'discord.js';
import { schedulers, enterChannel } from '../audio/scheduler.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import autoplayers from '../audio/autoplayers.js';

const types = {
	none: null,
};
autoplayers.forEach(data => {
	types[data.name] = data.autoplayer;
});

export default {
	data: new SlashCommandBuilder()
		.setName('autoplay')
		.setDescription('Sets the autoplayer type')
		.addStringOption(builder =>
			builder.setName('type')
				.setDescription('Type of autoplayer')
				.setRequired(true)
				.addChoices(...Object.keys(types).map(key => {
					return { name: key, value: key };
				})),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		let scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			if(!interaction.member.voice.channel) {
				await interaction.followUp(createSimpleFailure('You must be in a voice channel'));
				return;
			}
			scheduler = await enterChannel(interaction.member.voice.channel);
			if(!scheduler) {
				await interaction.followUp(createSimpleFailure('Failed to join voice channel in time, please try again later!'));
				return;
			}
		}
		else if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.followUp(createSimpleFailure('Must be in the same channel'));
			return;
		}
		const type = interaction.options.get('type').value;
		scheduler.autoplayer = types[type];
		scheduler.autoplay_channel = interaction.channel;
		await scheduler.processQueue();
		await interaction.followUp(createSimpleSuccess(`Changed autoplayer to \`${type}\``));
	},
};