const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    release_date: { type: String, required: true },
    poster_url: { type: String },
    overview: { type: String },
    avg_rating: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
});

module.exports = mongoose.model('Movie', movieSchema);
