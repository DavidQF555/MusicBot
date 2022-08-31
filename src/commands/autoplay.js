const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { readdirSync } = require('fs');

const types = {
	none: null
};
readdirSync('./src/audio/autoplayers').filter(file => file.endsWith('.js')).map(file => require(`../audio/autoplayers/${file}`)).forEach(data => {
	types[data.name] = data.autoplayer;
})

module.exports = {
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
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Not currently playing'));
			return;
		}
		scheduler.autoplayer = types[interaction.options.get('type').value];
		await interaction.deferReply();
		await scheduler.processQueue();
		await interaction.followUp(createSimpleSuccess('Changed autoplayer'));
	},
};