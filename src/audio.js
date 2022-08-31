const {
	AudioPlayerStatus,
	createAudioPlayer,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	createAudioResource,
	demuxProbe,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { promisify } = require('util');
const wait = promisify(setTimeout);
const { createSimpleFailure, createSimpleSuccess } = require('./util.js');





