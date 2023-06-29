import { createAudioResource } from '@discordjs/voice';
import { stream } from 'play-dl';
import { get } from '@davidqf555/simple-request';

export class AudioTrack {

	constructor(title, url) {
		this.title = title;
		this.url = url;
	}

	getStartText() {
		return `Playing [${this.title}](${this.url})`;
	}

	async createAudioResource() {
		const out = await stream(this.url);
		return createAudioResource(out.stream, { metadata: this, inputType: out.type });
	}
}

export async function searchTrack(query) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&key=${process.env.YT_DATA_KEY}`;
	const video = JSON.parse(await get(url)).items[0];
	return new AudioTrack(video.snippet.title, `https://youtu.be/${video.id.videoId}`);
}

export async function createTrack(id) {
	const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&maxResults=1&key=${process.env.YT_DATA_KEY}`;
	const video = JSON.parse(await get(url)).items[0];
	return new AudioTrack(video.snippet.title, `https://youtu.be/${id}`);
}