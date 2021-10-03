const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { schedulers } = require('../audio.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays a the queued tracks'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply('Nothing is currently queued');
			return;
		}
		const message = new MessageEmbed().setTitle('Queue');
		let desc = '';
		for (let i = 0; i < scheduler.queue.length; i++) {
			const track = scheduler.queue[i];
			let line = i + 1 + '. [' + track.title.substring(0, 40) + '](' + track.url + ')';
			if(i === scheduler.index) {
				line = '**' + line + '**';
			}
			desc += line + '\n';
		}
		message.setDescription(desc);
		await interaction.reply({ embeds: [message] });
	},
};