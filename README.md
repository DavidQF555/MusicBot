# Music Bot

This a basic Discord music bot created using [Node.js](https://nodejs.org/) and the [Discord.js](https://discord.js.org/) library. 

## Setup

1. Create a Discord application on the [Discord Developer Portal](https://discord.com/developers/applications)
2. In the *Bot* tab, click the *Add Bot* button
3. Copy the bot token and paste it as the **TOKEN** enviroment variable
4. Copy the client ID in the *OAth2* tab and paste it as the **CLIENT_ID** environment variable
5. Add the bot to servers using `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=3147776&scope=applications.commands%20bot`, replacing *CLIENT_ID* with the bot's client ID
6. Go to the [Google Cloud API Credentials Page](https://console.cloud.google.com/apis/credentials) and click *Create Credentials* and then *API Key*. If you want, you can restrict the key to only call *YouTube Data API v3*. Paste this key as the **YT_DATA_KEY** environment variable. This key is what the bot uses to search for videos on YouTube 
7. Start the bot with the command `npm start` in the console

### Environment Variables
| Key | Value |
| - | - |
| TOKEN | Token of Discord bot |
| CLIENT_ID | Client ID of Discord bot |
| YT_DATA_KEY | API key for YouTube Data API v3 |

## Usage

### Commands
| Name | Descripton |
| - | - |
| play | Queues a track using a query searched on YouTube |
| queue | Displays the current queue |
| skip | Skips the current track |
| clear | Clears the whole queue |
| loop | Toggles whether the queue should loop |
| remove | Removes a track from the queue based on the query |
| shuffle | Randomizes the order of the queue |