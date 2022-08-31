const { EmbedBuilder } = require('discord.js');

module.exports.createSimpleFailure = message => {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor('#0xFF0000')],
	};
};

module.exports.createSimpleSuccess = message => {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor('#0x00FF00')],
	};
};