module.exports = class LoopAutoplayer {

	async getNextTrack(scheduler) {
		if(scheduler.queue.length > 0) {
			scheduler.index = -1;
			await scheduler.processQueue();
		}
	}

	hasNextTrack(scheduler) {
		return scheduler.queue.length > 0;
	}

};