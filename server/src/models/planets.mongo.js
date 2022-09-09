const mongoose = require('mongoose');
const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    }
})

// connect planetsSchema with the planets collection
module.exports = mongoose.model('Planers', planetSchema)