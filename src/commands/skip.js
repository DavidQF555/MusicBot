const { SlashCommandBuilder } = require('@discordjs/builders');
const { schedulers } = require('../audio.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song'),
	async execute(interaction) {
		interaction.deferReply();
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length === 0) {
			await interaction.followUp('Nothing is currently queued');
			return;
		}
		else if(scheduler.atEnd()) {
			await interaction.followUp('At the end of the queue');
			return;
		}
		const skipped = await scheduler.skip();
		await interaction.followUp(`Skipping **${skipped.title}**`);
	},
};