const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    //release date
    //poster_url
    //overview
    //avg rating
    //comments
});

module.exports = mongoose.model('Movie', movieSchema);
