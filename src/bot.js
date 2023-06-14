import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Client, Collection, IntentsBitField } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import baseCommands from './commands.js';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildVoiceStates] });
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commands = new Collection();
await registerCommands();

client.on('interactionCreate', handleCommand);
client.once('ready', () => {
	console.log('Ready!');
});

client.login(process.env.TOKEN);

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
			await interaction.deferReply();
		}
		await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}