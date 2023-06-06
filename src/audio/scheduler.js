const {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { promisify } = require('util');
const wait = promisify(setTimeout);


module.exports.schedulers = new Map();

module.exports.AudioScheduler = class AudioScheduler {

	constructor(connection) {
		this.connection = connection;
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
				await this.processQueue();
			}
			else if (newState.status === AudioPlayerStatus.Playing) {
				newState.resource.metadata.onStart();
				this.playing = newState.resource.metadata;
			}
		});
		this.player.on('error', error => error.resource.metadata.onError(error));
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

	async enqueue(track) {
		this.queue.push(track);
		await this.processQueue();
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

};