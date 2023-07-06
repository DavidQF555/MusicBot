import 'dotenv/config';
import { REST, Client, Collection, IntentsBitField, Routes } from 'discord.js';
import { createSimpleFailure } from './util.js';
import baseCommands from './commands.js';
import { AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice';
import { schedulers } from './data.js';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildVoiceStates] });
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
const timeout = 600e3;

const commands = new Collection();
await registerCommands();

client.on('interactionCreate', handleCommand);
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.TOKEN);

setInterval(update, timeout);

async function registerCommands() {
	for (const command of baseCommands) {
		commands.set(command.data.name, command);
	}
	try {
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands.map(file => file.data.toJSON()) },
		);
		console.log('Successfully registered application commands.');
	}
	catch (error) {
		console.error(error);
	}
}

async function handleCommand(interaction) {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if(!interaction.deferred) {
			await interaction.deferReply({ ephemeral:true });
		}
		await interaction.followUp(createSimpleFailure('There was an error while executing this command!'));
	}
}

function update() {
	for(const guild of client.guilds.cache.values()) {
		const scheduler = schedulers[guild.id];
		if(scheduler && scheduler.connection.state.status !== VoiceConnectionStatus.Destroyed && (guild.members.me.voice.channel.members.size <= 1 || scheduler.player.state.status === AudioPlayerStatus.Idle && Date.now() - scheduler.update >= timeout)) {
			scheduler.connection.destroy();
		}
	}
}