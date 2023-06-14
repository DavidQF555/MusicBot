import { EmbedBuilder } from 'discord.js';

export function createSimpleFailure(message, ephemeral = true) {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0xFF0000)],
		ephemeral: ephemeral,
	};
}

export function createSimpleSuccess(message, ephemeral = true) {
	return {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0x00FF00)],
		ephemeral: ephemeral,
	};
}