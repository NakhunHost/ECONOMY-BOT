const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder().setName('start').setDescription('Start your company'),
    new SlashCommandBuilder().setName('balance').setDescription('Check your balance'),
    new SlashCommandBuilder().setName('collect').setDescription('Collect money from your business'),
    new SlashCommandBuilder().setName('buy-business').setDescription('Buy a new business')
        .addStringOption(option => 
            option.setName('business')
                .setDescription('Name of the business to buy')
                .setRequired(true)),
    new SlashCommandBuilder().setName('help').setDescription('List all available commands')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Refreshing slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands registered!');
    } catch (error) {
        console.error(error);
    }
})();
