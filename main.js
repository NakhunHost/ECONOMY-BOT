const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Load business and user data
const businesses = JSON.parse(fs.readFileSync('businesses.json', 'utf8'));
const dataFile = 'data.json';
let userData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};

// Save user data
function saveData() {
    fs.writeFileSync(dataFile, JSON.stringify(userData, null, 2));
}

// Initialize user profile
function getUser(id) {
    if (!userData[id]) {
        userData[id] = { balance: 1000, businesses: [], lastCollected: null };
    }
    return userData[id];
}

// Calculate earnings
function collectEarnings(user) {
    const now = Date.now();
    const lastCollected = user.lastCollected || 0;
    const timeDiff = now - lastCollected;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));

    if (hours < 1) {
        return { earned: 0, cooldown: 1 - hours };
    }

    const earnings = user.businesses.reduce((total, biz) => total + biz.earnings, 0);
    user.lastCollected = now;
    return { earned: earnings * hours, cooldown: 0 };
}

// Create the bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, user } = interaction;
    const userProfile = getUser(user.id);

    if (commandName === 'start') {
        if (userProfile.businesses.length > 0) {
            await interaction.reply("You already own a company!");
        } else {
            userProfile.businesses.push(businesses[0]); // Start with the Lemonade Stand
            saveData();
            await interaction.reply("Congratulations! You started a **Lemonade Stand**. Use `/collect` to gather earnings.");
        }
    }

    else if (commandName === 'balance') {
        await interaction.reply(`You have **${userProfile.balance} coins**.`);
    }

    else if (commandName === 'collect') {
        const { earned, cooldown } = collectEarnings(userProfile);
        if (earned > 0) {
            userProfile.balance += earned;
            saveData();
            await interaction.reply(`You collected **${earned} coins** from your businesses!`);
        } else {
            await interaction.reply(`Please wait **${cooldown} hour(s)** before collecting again.`);
        }
    }

    else if (commandName === 'buy-business') {
        const businessName = interaction.options.getString('business');
        const business = businesses.find(b => b.name.toLowerCase() === businessName.toLowerCase());

        if (!business) {
            await interaction.reply("Invalid business name. Use `/help` to see available businesses.");
            return;
        }

        if (userProfile.balance < business.price) {
            await interaction.reply("You don't have enough coins to buy this business.");
        } else {
            userProfile.balance -= business.price;
            userProfile.businesses.push(business);
            saveData();
            await interaction.reply(`You bought a **${business.name}** for **${business.price} coins**! It will now generate **${business.earnings} coins/hour**.`);
        }
    }

    else if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setTitle("Economy Bot Commands")
            .setDescription(`
- **/start** → Start your company  
- **/balance** → Check your balance  
- **/collect** → Collect money from your businesses  
- **/buy-business [name]** → Buy a business  
- **/help** → Show this help message
            `)
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [helpEmbed] });
    }
});

// Login to Discord
client.login(process.env.TOKEN);
