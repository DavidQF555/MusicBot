export const schedulers = {};

const guildData = {};

export function remove(guildId, query) {
	const queue = getQueue(guildId);
	const index = getCurrentIndex();
	for(let i = 0; i < queue.length; i++) {
		const track = queue[i];
		if(track.title.toLowerCase().includes(query)) {
			queue.splice(i, 1);
			if((index || index === 0) && i <= index) {
				const scheduler = schedulers[guildId];
				if(index === i && scheduler) {
					scheduler.skip();
				}
				setCurrentIndex(index - 1);
			}
			return track;
		}
	}
}

export function shuffle(guildId) {
	const queue = getQueue(guildId);
	const index = getCurrentIndex(guildId);
	let current = queue.length, random;
	while(current != 0) {
		random = Math.floor(Math.random() * current);
		current--;
		[queue[current], queue[random]] = [queue[random], queue[current]];
		if(current === index) {
			setCurrentIndex(random);
		}
		else if(random === index) {
			setCurrentIndex(current);
		}
	}
}

export function clear(guildId) {
	getData(guildId).queue = [];
	setCurrentIndex(-1);
	const scheduler = schedulers[guildId];
	if(scheduler) {
		scheduler.queueLock = false;
		scheduler.player.stop(true);
	}
}

export function getQueue(guildId) {
	const data = getData(guildId);
	if(!data.queue) {
		data.queue = [];
	}
	return data.queue;
}

export function setCurrentIndex(guildId, index) {
	getData(guildId).index = index;
}

export function getCurrentIndex(guildId) {
	const data = getData(guildId);
	if(!data.index && data.index !== 0) {
		data.index = -1;
	}
	return data.index;
}

export function getAutoplayer(guildId) {
	return getData(guildId).autoplayer;
}

export function setAutoplayer(guildId, autoplayer) {
	getData(guildId).autoplayer = autoplayer;
}

export function getMessage(guildId) {
	return getData(guildId).message;
}

export function setMessage(guildId, message) {
	getData(guildId).message = message;
}

function getData(guildId) {
	if(!guildData[guildId]) {
		guildData[guildId] = {};
	}
	return guildData[guildId];
}