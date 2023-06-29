import { getQueue } from '../../data.js';

export default {
	name: 'loop',
	isSetup: true,
	autoplayer: {
		getNextTrack: async function(scheduler) {
			if(scheduler.queue.length > 0) {
				scheduler.index = -1;
			}
		},
		hasNextTrack: function(guildId) {
			return getQueue(guildId).length > 0;
		},
	},

};