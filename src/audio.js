const {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	createAudioResource,
	demuxProbe,
} = require('@discordjs/voice');
const { raw } = require('youtube-dl-exec');
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
			const process = raw(
				this.url,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] },
			);
			if (!process.stdout) {
				reject(new Error('No stdout'));
				return;
			}
			const stream = process.stdout;
			const onError = error => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			};
			process.once('spawn', () => {
				demuxProbe(stream)
					.then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
					.catch(onError);
			}).catch(onError);
		});
	}
};

module.exports.AudioScheduler = class AudioScheduler {

	constructor(connection) {
		this.connection = connection;
		this.player = createAudioPlayer();
		this.connection.subscribe(this.player);
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
	}

	async processQueue() {
		if (this.queueLock || this.player.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
			return;
		}
		this.nextIndex();
		this.queueLock = true;
		const next = this.queue[this.index];
		try {
			const resource = await next.createAudioResource();
			next.onStart();
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
		this.index++;
	}

	atEnd() {
		return this.index >= this.queue.length - 1;
	}

};
