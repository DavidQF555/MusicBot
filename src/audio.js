const {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	createAudioResource,
	demuxProbe,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { promisify } = require('util');
const wait = promisify(setTimeout);
const { createSimpleFailure, createSimpleSuccess } = require('./util.js');

module.exports.schedulers = new Map();

module.exports.AudioTrack = class AudioTrack {

	constructor(title, url, channel) {
		this.title = title;
		this.url = url;
		this.channel = channel;
	}

	onStart() {
		this.channel.send(createSimpleSuccess(`Now playing [${this.title}](${this.url})`)).catch(console.warn);
	}

	onError(error) {
		console.warn(error);
		this.channel.send(createSimpleFailure(`Error: ${error.message}`)).catch(console.warn);
	}

	async createAudioResource() {
		return new Promise((resolve, reject) => {
			demuxProbe(ytdl(this.url, { filter: 'audio' }))
				.then(probe => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
				.catch(reject);
		});
	}
};

module.exports.AudioScheduler = class AudioScheduler {

	constructor(connection) {
		this.connection = connection;
		this.player = createAudioPlayer();
		this.queue = [];
		this.index = -1;
		this.loop = false;
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
				await this.processQueue();
			}
			else if (newState.status === AudioPlayerStatus.Playing) {
				newState.resource.metadata.onStart();
			}
		});
		this.player.on('error', error => error.resource.metadata.onError(error));
		this.connection.subscribe(this.player);
	}

	async processQueue() {
		if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle || !this.hasNextTrack()) {
			return;
		}
		this.nextIndex();
		this.queueLock = true;
		const next = this.queue[this.index];
		try {
			const resource = await next.createAudioResource();
			this.player.play(resource);
		}
		catch (error) {
			next.onError(error);
			await this.processQueue();
		}
		finally{
			this.queueLock = false;
		}
	}

	async enqueue(track) {
		this.index = Math.min(this.index, this.queue.length - 1);
		this.queue.push(track);
		await this.processQueue();
	}

	stop() {
		this.queueLock = true;
		this.queue = [];
		this.index = -1;
		this.player.stop(true);
	}

	async skip() {
		this.queueLock = false;
		const skipped = this.queue[this.index];
		this.player.stop(true);
		await this.processQueue();
		return skipped;
	}

	nextIndex() {
		if(this.loop && this.index >= this.queue.length - 1) {
			this.index = 0;
			return;
		}
		this.index++;
	}

	hasNextTrack() {
		return this.queue.length != 0 && (this.loop || this.index < this.queue.length - 1);
	}

	async remove(index) {
		this.queue.splice(index, 1);
		if(index <= this.index) {
			if(this.index == index) {
				await this.skip();
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

	async toggleLoop() {
		this.loop = !this.loop;
		if(this.loop) {
			await this.processQueue();
		}
	}

};
