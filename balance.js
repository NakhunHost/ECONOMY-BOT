const mongoose = require('mongoose');
const Player = require('./models/Player');  // Assuming your Player model is in /models/Player.js

// Add money to a player's balance
async function addMoney(userId, amount) {
    try {
        let player = await Player.findOne({ userId: userId });
        if (!player) {
            player = new Player({ userId: userId });
        }

        player.balance += amount;  // Add the specified amount to the balance
        await player.save();  // Save changes to the database

        console.log(`Added ${amount} to ${userId}'s balance. New balance: ${player.balance}`);
    } catch (err) {
        console.error('Error adding money:', err);
    }
}

// Get a player's balance
async function getBalance(userId) {
    try {
        const player = await Player.findOne({ userId: userId });
        if (!player) return 0;  // If the player doesn't exist, return 0

        return player.balance;
    } catch (err) {
        console.error('Error retrieving balance:', err);
        return 0;  // Return 0 if there is an error
    }
}

module.exports = { addMoney, getBalance };
