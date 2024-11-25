const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    movie_title: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    poster_path: { type: String },
    movieId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('Review', reviewSchema);
