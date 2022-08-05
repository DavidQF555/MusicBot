const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers, LoopAutoplayer } = require('../audio.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

const types = {
	none: null,
	loop: new LoopAutoplayer(),
}

function getChoices() {
	const choices = [];
	let value = 0;
	for(let key in Object.keys(types)) {
		value = choices.push({
			name:key,
			value:value,
		});
	}
	return choices;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autoplay')
		.setDescription('Sets the autoplayer type')
		.addStringOption(builder =>
			builder.setName('type')
				.setDescription('Type of autoplayer')
				.setRequired(true)
				.addChoices(getChoices()),
		),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Not currently playing'));
			return;
		}
		scheduler.autoplayer = types[interaction.options.get('type').value];
			await interaction.reply(createSimpleSuccess('Changed autoplayer'));
	},
};