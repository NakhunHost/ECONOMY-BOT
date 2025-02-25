const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // User ID for Discord
    balance: { type: Number, default: 0 }, // User's balance
    businesses: { type: [String], default: [] }, // User's businesses
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
