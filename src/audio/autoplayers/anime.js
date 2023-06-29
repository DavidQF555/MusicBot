import fetch from 'node-fetch';
import { searchTrack } from '../../audio/track.js';

const searchCount = 100;

export default {
	name: 'anime',
	isSetup: process.env.MAL_API_ID,
	autoplayer: {
		getNextTrack: async function() {
			const top = await getTopAnime(searchCount);
			const selected = top[Math.floor(Math.random() * top.length)].node;
			const count = await getOpeningsCount(selected.id);
			const search = `${selected.title} anime opening ${Math.floor(Math.random() * count) + 1}`;
			return searchTrack(search);
		},
		hasNextTrack: () => true,
	},
};

async function getTopAnime(count) {
	const url = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=${count}`;
	return (await (await fetch(url, { headers: [['X-MAL-CLIENT-ID', process.env.MAL_API_ID]] })).json()).data;
}

async function getOpeningsCount(id) {
	const url = `https://api.myanimelist.net/v2/anime/${id}?fields=opening_themes`;
	return (await (await fetch(url, { headers: [['X-MAL-CLIENT-ID', process.env.MAL_API_ID]] })).json()).opening_themes.length;
}