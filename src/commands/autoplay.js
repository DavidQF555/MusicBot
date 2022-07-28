const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers, LoopAutoplayer } = require('../audio.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

const types = {
	'none': scheduler => null,
	'loop': scheduler => new LoopAutoplayer(scheduler),
}

getChoices() {
	const choices = [];
	for(let key in Object.keys(types)) {
		choices.push({
			'name':key,
			'value':key
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
		scheduler.autoplayer = types[interaction.options.get('type').value](scheduler);
			await interaction.reply(createSimpleSuccess('Changed autoplayer'));
	},
};