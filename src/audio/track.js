import fetch from 'node-fetch';
import { createAudioResource, demuxProbe } from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';

export class AudioTrack {

	constructor(title, url) {
		this.title = title;
		this.url = url;
	}

	getStartText() {
		return `Playing [${this.title}](${this.url})`;
	}

	createAudioResource() {
		return new Promise((resolve, reject) => {
			demuxProbe(ytdl(this.url, { filter: 'audio' }))
				.then(probe => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
				.catch(reject);
		});
	}
}

export async function searchTrack(query) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&key=${process.env.YT_DATA_KEY}`;
	const video = (await (await fetch(url)).json()).items[0];
	return new AudioTrack(video.snippet.title, `https://youtu.be/${video.id.videoId}`);
}

export async function createTrack(id) {
	const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&maxResults=1&key=${process.env.YT_DATA_KEY}`;
	const video = (await (await fetch(url)).json()).items[0];
	return new AudioTrack(video.snippet.title, `https://youtu.be/${id}`);
}