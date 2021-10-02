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

module.exports.schedulers = new Map();

module.exports.AudioTrack = class AudioTrack {

	constructor(title, url, onStart, onFinish, onError) {
		this.title = title;
		this.url = url;
		this.onStart = onStart;
		this.onFinish = onFinish;
		this.onError = onError;
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
			})
				.catch(onError);
		});
	}
};

module.exports.AudioScheduler = class AudioScheduler {

	constructor(connection) {
		this.connection = connection;
		this.player = createAudioPlayer();
		this.connection.subscribe(this.player);
		this.queue = [];
		this.connection.on('stateChange', async (oldState, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
					try {
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000);
					}
					catch {
						this.connection.destroy();
					}
				}
				else if (this.connection.rejoinAttempts < 5) {
					await wait((this.connection.rejoinAttempts + 1) * 5_000);
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
					await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
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
		this.queueLock = true;

		const next = this.queue.shift();
		try {
			const resource = await next.createAudioResource();
			this.player.play(resource);
		}
		catch (error) {
			next.onError(error);
			return this.processQueue();
		}
		finally{
			this.queueLock = false;
		}
	}

	async enqueue(track) {
		this.queue.push(track);
		await this.processQueue();
	}

	stop() {
		this.queueLock = true;
		this.queue = [];
		this.player.stop(true);
	}

};
