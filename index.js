const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// --- CONFIGURATION ---
const PREFIX = '!';

// --- 1. READY & DYNAMIC STATUS ---
client.once('ready', () => {
    console.log(`✅ Script4Exec connected as ${client.user.tag}!`);

    const statuses = [
        { name: 'Searching Scripts 🔍', type: ActivityType.Watching },
        { name: 'sp1ngimsp1ng.github.io', type: ActivityType.Competing }
    ];

    let i = 0;
    setInterval(() => {
        client.user.setActivity(statuses[i]);
        i = (i + 1) % statuses.length;
    }, 10000);
});

// --- 2. COMMANDS: !scriptblox search & !rscripts search ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Command: !scriptblox search [keyword]
    if (command === 'scriptblox') {
        const subCommand = args.shift()?.toLowerCase();
        if (subCommand !== 'search') {
            return message.reply('⚠️ Usage: `!scriptblox search [keyword]`');
        }

        const query = args.join(' ');
        if (!query) {
            return message.reply('⚠️ Please specify a keyword (e.g. `!scriptblox search blox fruits`).');
        }

        const loadingMsg = await message.channel.send(`🔍 Searching ScriptBlox for **"${query}"**...`);

        try {
            const response = await fetch(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&mode=free`);
            const data = await response.json();

            const scripts = data.result?.scripts;
            if (!scripts || scripts.length === 0) {
                return loadingMsg.edit(`❌ No scripts found on ScriptBlox for **"${query}"**.`);
            }

            const topScripts = scripts.slice(0, 3);
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`🔎 ScriptBlox Results for "${query}"`)
                .setTimestamp();

            topScripts.forEach((s, index) => {
                embed.addFields({
                    name: `${index + 1}. ${s.title}`,
                    value: `🎮 **Game:** ${s.game?.name || 'Unknown'}\n👁️ **Views:** ${s.views || 0} | 👍 **Verified:** ${s.verified ? 'Yes' : 'No'}\n🔗 [View Script](https://scriptblox.com/script/${s.slug})`
                });
            });

            await loadingMsg.edit({ content: null, embeds: [embed] });
        } catch (err) {
            console.error('ScriptBlox API error:', err);
            await loadingMsg.edit('❌ An error occurred while searching ScriptBlox.');
        }
    }

    // Command: !rscripts search [keyword]
    if (command === 'rscripts') {
        const subCommand = args.shift()?.toLowerCase();
        if (subCommand !== 'search') {
            return message.reply('⚠️ Usage: `!rscripts search [keyword]`');
        }

        const query = args.join(' ');
        if (!query) {
            return message.reply('⚠️ Please specify a keyword (e.g. `!rscripts search bedwars`).');
        }

        const loadingMsg = await message.channel.send(`🔍 Searching RScripts for **"${query}"**...`);

        try {
            const response = await fetch(`https://rscripts.net/api/scripts?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            const scripts = data.scripts || data;
            if (!scripts || scripts.length === 0) {
                return loadingMsg.edit(`❌ No scripts found on RScripts for **"${query}"**.`);
            }

            const topScripts = scripts.slice(0, 3);
            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle(`🔎 RScripts Results for "${query}"`)
                .setTimestamp();

            topScripts.forEach((s, index) => {
                embed.addFields({
                    name: `${index + 1}. ${s.title || s.name || 'Untitled Script'}`,
                    value: `🎮 **Game:** ${s.game || 'Universal'}\n👁️ **Views:** ${s.views || 0}\n🔗 [View Script](https://rscripts.net/script/${s._id || s.slug})`
                });
            });

            await loadingMsg.edit({ content: null, embeds: [embed] });
        } catch (err) {
            console.error('RScripts API error:', err);
            await loadingMsg.edit('❌ An error occurred while searching RScripts.');
        }
    }
});

// --- RENDER WEB SERVER ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Script4Exec Bot is online!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dummy web server listening on port ${PORT}`);
});

console.log('Token retrieved:', process.env.DISCORD_TOKEN ? 'Present' : 'MISSING!');
client.login(process.env.DISCORD_TOKEN);
