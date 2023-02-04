const { SlashCommandBuilder } = require('@discordjs/builders');
const { schedulers } = require('../audio/scheduler.js');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the queued tracks'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler || scheduler.queue.length == 0) {
			await interaction.reply(createSimpleFailure('Nothing is currently queued'));
			return;
		}
		let desc = 'Queue\n';
		for (let i = 0; i < scheduler.queue.length; i++) {
			const track = scheduler.queue[i];
			let line = i + 1 + '. [' + track.title.substring(0, 40) + '](' + track.url + ')';
			if(i == scheduler.index && scheduler.player.state.status !== AudioPlayerStatus.Idle) {
				line = '> **' + line + '**';
			}
			desc += line + '\n';
		}
		await interaction.reply(createSimpleSuccess(desc));
	},
};