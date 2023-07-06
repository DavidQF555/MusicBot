import { SlashCommandBuilder } from 'discord.js';
import { schedulers, setAutoplayer } from '../data.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import autoplayers from '../audio/autoplayers.js';

const types = {
	none: null,
};
autoplayers.forEach(data => {
	if(data.isSetup) {
		types[data.name] = data.autoplayer;
	}
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
		const scheduler = schedulers[interaction.guildId];
		if(scheduler && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		const type = interaction.options.get('type').value;
		const autoplayer = types[type];
		setAutoplayer(interaction.guildId, autoplayer);
		await interaction.reply(createSimpleSuccess(`Changed autoplayer to \`${type}\``));
		if(scheduler) {
			await scheduler.processQueue();
		}
	},
};