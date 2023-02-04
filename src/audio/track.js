const {
	createAudioResource,
} = require('@discordjs/voice');
const { stream } = require('play-dl');
const { createSimpleFailure, createSimpleSuccess } = require('../util.js');
const { get } = require('@davidqf555/simple-request');

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
		const out = await stream(this.url);
		return createAudioResource(out.stream, { metadata: this, inputType: out.type });
	}
};

module.exports.createTrack = async function createTrack(query, channel) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&key=${process.env.YT_DATA_KEY}`;
	const video = JSON.parse(await get(url)).items[0];
	return new module.exports.AudioTrack(video.snippet.title, `https://www.youtube.com/watch?v=${video.id.videoId}`, channel);
};