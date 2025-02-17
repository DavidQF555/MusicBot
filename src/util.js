import { EmbedBuilder, MessageFlags } from 'discord.js';

export function createSimpleFailure(message, ephemeral = true) {
	const output = {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0xFF0000)],
	};
	if(ephemeral) {
		output.flags = MessageFlags.Ephemeral;
	}
	return output;
}

export function createSimpleSuccess(message, ephemeral = true) {
	const output = {
		embeds: [new EmbedBuilder().setDescription(message).setColor(0x00FF00)],
	};
	if(ephemeral) {
		output.flags = MessageFlags.Ephemeral;
	}
	return output;
}