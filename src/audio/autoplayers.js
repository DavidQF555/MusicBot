import { readdirSync } from 'fs';

const autoplayers = Promise.all(readdirSync('./src/audio/autoplayers').filter(file => file.endsWith('js')).map(file => import(`./autoplayers/${file}`).then(module => module.default)));

export default await autoplayers;