const {
	createAudioResource,
	demuxProbe,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');

module.exports = class AudioTrack {

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