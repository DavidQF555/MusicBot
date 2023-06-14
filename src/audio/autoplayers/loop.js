export default {
	name: 'loop',
	isSetup: true,
	autoplayer: {
		getNextTrack: async function(scheduler) {
			if(scheduler.queue.length > 0) {
				scheduler.index = -1;
				await scheduler.processQueue();
			}
		},
		hasNextTrack: function(scheduler) {
			return scheduler.queue.length > 0;
		},
	},

};