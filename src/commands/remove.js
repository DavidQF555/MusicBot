const { SlashCommandBuilder } = require('@discordjs/builders');
const{ schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a track from the queue')
		.addStringOption(builder =>
			builder.setName('query')
				.setDescription('Query to search for in the queue')
				.setRequired(true),
		),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		interaction.deferReply();
		const query = interaction.options.get('query').value.toLowerCase();
		for(let i = 0; i < scheduler.queue.length; i++) {
			const track = scheduler.queue[i];
			if(track.title.toLowerCase().includes(query)) {
				scheduler.remove(i);
				await interaction.followUp(createSimpleSuccess(`Removed [${track.title}](${track.url}) from the queue`));
				return;
			}
		}
		await interaction.followUp(createSimpleFailure(`Could not find \`${query}\` within the queue`));
	},
};