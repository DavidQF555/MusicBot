const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { readdirSync } = require('fs');

const types = {
	none: null,
};
readdirSync('./src/audio/autoplayers').filter(file => file.endsWith('.js')).map(file => require(`../audio/autoplayers/${file}`)).filter(data => data.isSetup).forEach(data => {
	types[data.name] = data.autoplayer;
});

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
		if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
			await interaction.reply(createSimpleFailure('Must be in the same channel'));
			return;
		}
		const type = interaction.options.get('type').value;
		scheduler.autoplayer = types[type];
		scheduler.autoplay_channel = interaction.channel;
		await interaction.deferReply();
		await scheduler.processQueue();
		await interaction.followUp(createSimpleSuccess(`Changed autoplayer to \`${type}\``));
	},
};