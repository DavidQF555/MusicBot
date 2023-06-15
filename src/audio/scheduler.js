import {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	joinVoiceChannel,
} from '@discordjs/voice';
import { promisify } from 'util';
import { createSimpleFailure, createSimpleSuccess } from '../util.js';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, ComponentType } from 'discord.js';
const wait = promisify(setTimeout);


export const schedulers = new Map();

export async function enterChannel(channel) {
	const scheduler = new AudioScheduler(
		joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		}), channel,
	);
	scheduler.connection.on('error', console.warn);
	schedulers.set(channel.guildId, scheduler);
	try {
		await entersState(scheduler.connection, VoiceConnectionStatus.Ready, 20e3);
	}
	catch (error) {
		console.warn(error);
		return;
	}
	return scheduler;
}

export class AudioScheduler {

	constructor(connection, channel) {
		this.connection = connection;
		this.channel = channel;
		this.player = createAudioPlayer();
		this.queue = [];
		this.index = -1;
		this.connection.on('stateChange', async (oldState, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
					try {
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 5e3);
					}
					catch {
						this.connection.destroy();
					}
				}
				else if (this.connection.rejoinAttempts < 5) {
					await wait((this.connection.rejoinAttempts + 1) * 5e3);
					this.connection.rejoin();
				}
				else {
					this.connection.destroy();
				}
			}
			else if (newState.status === VoiceConnectionStatus.Destroyed) {
				this.stop();
				this.resetMessage();
				schedulers.delete(this.channel.guild.id);
			}
			else if (!this.readyLock && (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
				this.readyLock = true;
				try {
					await entersState(this.connection, VoiceConnectionStatus.Ready, 20e3);
				}
				catch {
					if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) this.connection.destroy();
				}
				finally {
					this.readyLock = false;
				}
			}
		});
		this.player.on('stateChange', async (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
				this.playing = null;
				this.resetMessage();
				await this.processQueue();
			}
			else if (newState.status === AudioPlayerStatus.Playing) {
				this.playing = newState.resource.metadata;
				this.resetMessage();
				this.message = await this.sendMessage(newState.resource.metadata.getStartText());
			}
		});
		this.player.on('error', console.log);
		this.connection.subscribe(this.player);
	}

	async processQueue() {
		if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle) {
			return;
		}
		let track;
		if(this.index < this.queue.length - 1) {
			this.index++;
			track = this.queue[this.index];
		}
		else if (this.autoplayer && this.autoplayer.hasNextTrack(this)) {
			track = await this.autoplayer.getNextTrack(this);
			if(!track) {
				return;
			}
		}
		else {
			return;
		}
		try {
			const resource = await track.createAudioResource();
			this.player.play(resource);
		}
		catch (error) {
			track.onError(error);
			await this.processQueue();
		}
		finally {
			this.queueLock = false;
		}
	}

	resetMessage() {
		if(this.message) {
			this.message.delete();
			this.message = null;
		}
	}

	async enqueue(track) {
		this.queue.push(track);
		await this.processQueue();
	}

	async sendMessage(text) {
		const message = createSimpleSuccess(text, false);
		const skip = new ButtonBuilder()
			.setLabel('Skip')
			.setCustomId('skip')
			.setStyle(ButtonStyle.Danger);
		message.components = [new ActionRowBuilder().addComponents(skip)];
		const response = await this.channel.send(message);
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
		collector.on('collect', async interaction => {
			if(interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
				await interaction.reply(createSimpleFailure('Must be in the same channel'));
				return;
			}
			if(this.hasNextTrack() || this.player.state.status !== AudioPlayerStatus.Idle || this.queueLock) {
				const skipped = this.skip();
				await interaction.reply(createSimpleSuccess(`Successfully skipped [${skipped.title}](${skipped.url})`));
			}
		});
		return response;
	}

	hasNextTrack() {
		return this.index < this.queue.length - 1 || (this.autoplayer && this.autoplayer.hasNextTrack(this));
	}

	stop() {
		this.queueLock = true;
		this.queue = [];
		this.index = -1;
		this.player.stop(true);
	}

	skip() {
		this.queueLock = false;
		const skipped = this.playing;
		this.player.stop(true);
		return skipped;
	}

	nextIndex() {
		if(this.loop && this.index >= this.queue.length - 1) {
			this.index = 0;
			return;
		}
		this.index++;
	}

	remove(index) {
		this.queue.splice(index, 1);
		if(index <= this.index) {
			if(this.index == index) {
				this.skip();
			}
			this.index--;
		}
	}

	clear() {
		this.queueLock = false;
		this.index = 0;
		this.queue = [];
		this.player.stop(true);
	}

	shuffle() {
		let current = this.queue.length, random;
		while (current != 0) {
			random = Math.floor(Math.random() * current);
			current--;
			[this.queue[current], this.queue[random]] = [this.queue[random], this.queue[current]];
			if(current == this.index) {
				this.index = random;
			}
			else if(random == this.index) {
				this.index = current;
			}
		}
	}

}