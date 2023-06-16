import {
	SlashCommandBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ComponentType } from 'discord.js';
import { schedulers } from '../audio/scheduler.js';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import { AudioPlayerStatus } from '@discordjs/voice';

const MAX_PER_PAGE = 10;
const MAX_LENGTH = 40;

export default {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the queued tracks'),
	async execute(interaction) {
		const scheduler = schedulers.get(interaction.guildId);
		if(!scheduler) {
			await interaction.reply(createSimpleFailure('Not currently playing'));
			return;
		}
		const message = getMessage(scheduler.queue, 0, scheduler.player.state.status === AudioPlayerStatus.Idle ? -1 : scheduler.index);
		const response = await interaction.reply(message);
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
		let page = 0;
		collector.on('collect', async press => {
			const s = schedulers.get(press.guildId);
			if(!s) {
				await press.deferUpdate();
				await press.deleteReply();
				return;
			}
			if(press.customId == 'prev') {
				page = Math.max(0, page - 1);
			}
			else if(press.customId == 'next') {
				page++;
			}
			await press.update(getMessage(s.queue, Math.min(page, s.queue.length - 1), s.index));
		});
	},
};

function getMessage(queue, page, current) {
	const buttons = new ActionRowBuilder();
	const refresh = new ButtonBuilder()
		.setCustomId('refresh')
		.setLabel('Refresh')
		.setStyle(ButtonStyle.Secondary);
	buttons.addComponents(refresh);
	let desc;
	if(queue.length === 0) {
		desc = 'Nothing is currently queued';
	}
	else {
		desc = '**Queue**\n';
		const end = Math.min(queue.length, (page + 1) * MAX_PER_PAGE);
		for (let i = page * MAX_PER_PAGE; i < end; i++) {
			const track = queue[i];
			let line = i + 1 + '. [' + track.title.substring(0, MAX_LENGTH) + '](' + track.url + ')';
			if(i == current) {
				line = '> **' + line + '**';
			}
			desc += line;
			if(i != end - 1) {
				desc += '\n';
			}
		}
		desc += `\n\nPage ${page + 1} of ${Math.ceil(queue.length / MAX_PER_PAGE)}`;
		const prev = new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('Previous')
			.setDisabled(page == 0)
			.setStyle(ButtonStyle.Primary);
		const next = new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next')
			.setDisabled((page + 1) * MAX_PER_PAGE >= queue.length)
			.setStyle(ButtonStyle.Primary);
		buttons.addComponents(prev, next);
	}
	const message = createSimpleSuccess(desc);
	message.components = [buttons];
	return message;
}