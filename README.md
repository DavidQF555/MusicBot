# Music Bot
This a basic Discord music bot created using [Node.js](https://nodejs.org/) and the [Discord.js](https://discord.js.org/) library. 

## Setup
---
### **Install Node.js and npm**
If Node.js and npm are already installed, skip this step. If not, follow these [instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### **Create Discord bot**
1. Create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications)
2. In the *Bot* tab, click the *Add Bot* button
3. Copy the bot token and paste it as the **TOKEN** enviroment variable
4. Copy the client ID in the *OAuth2* tab and paste it as the **CLIENT_ID** environment variable
5. Go to the [Google Cloud API Credentials Page](https://console.cloud.google.com/apis/credentials) and click *Create Credentials* and then *API Key*. If you want, you can restrict the key to only call *YouTube Data API v3*. Paste this key as the **YT_DATA_KEY** environment variable. This key is what the bot uses to search for videos on YouTube
6. Optionally, to enable the anime opening autoplayer, create a client ID for the [MyAnimeList API v2](https://myanimelist.net/apiconfig). Ensure the *App Type* field is set to **web**. None of the other fields have specifically required values. Paste the client ID as the **MAL_API_ID** environment variable. This is what the anime opening autoplayer uses to search for the most popular anime series
7. Add the bot to servers using `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=3147776&scope=applications.commands%20bot`, replacing *CLIENT_ID* with the bot's client ID

### **Start the bot**
1. Install all packages by running `npm install` in the console at the directory of the bot
2. Start the bot with the command `npm start` in the console at the directory of the bot

## Environment Variables
| Key | Value | Required |
| - | - | - |
| TOKEN | Token of Discord bot | yes |
| CLIENT_ID | Client ID of Discord bot | yes |
| YT_DATA_KEY | API key for [YouTube Data API v3](https://console.cloud.google.com/apis/credentials) | yes |
| MAL_API_ID | Client ID for [MyAnimeList API v2](https://myanimelist.net/apiconfig) | no |

## Usage
---
### Commands
| Name | Description |
| - | - |
| play | Queues a track using a query searched on YouTube |
| queue | Displays the current queue |
| skip | Skips the current track |
| clear | Clears the whole queue |
| remove | Removes a track from the queue based on the query |
| shuffle | Randomizes the order of the queue |
| autoplay | Sets the autoplayer |
| leave | Tells this bot to leave the voice channel |
| join | Joins the current channel |