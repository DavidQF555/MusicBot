const { Jikan4 } = require('node-myanimelist');
const { createTrack } = require('../../audio/track.js');

const searchCount = 100;
const maxPerPage = 25;

module.exports = {
	name: 'anime',
	autoplayer: {
		getNextTrack: async function(scheduler) {
			let data = [];
			for(let i = 0; i < searchCount / maxPerPage; i++) {
				const search = await new Promise(resolve => setTimeout(resolve, 2000))
					.then(() => {
						return Jikan4.animeSearch({
							limit: Math.min(searchCount - maxPerPage * i, maxPerPage),
							order_by: 'members',
							sort: 'desc',
							page: i + 1,
						});
					});
				data = data.concat(search.data);
			}
			const options = [];
			for(const anime of data) {
				let title;
				if(anime.title) {
					title = anime.title;
				}
				else if(anime.title_english) {
					title = anime.title_english;
				}
				else if (anime.title_japanese) {
					title = anime.title_japanese;
				}
				else {
					continue;
				}
				for(let j = 0; j < anime.themes.length; j++) {
					options.push(`${title} opening ${j + 1}`);
				}
			}
			return createTrack(options[Math.floor(Math.random() * options.length)], scheduler.autoplay_channel);
		},
		hasNextTrack: () => true,
	},
};