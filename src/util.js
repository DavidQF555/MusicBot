const { EmbedBuilder } = require('discord.js');

module.exports.createSimpleFailure = (message, ephemeral = true) => {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0xFF0000)],
		ephemeral: ephemeral,
	};
};

module.exports.createSimpleSuccess = (message, ephemeral = true) => {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0x00FF00)],
		ephemeral: ephemeral,
	};
};