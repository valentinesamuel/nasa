const mongoose = require('mongoose');
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL
mongoose.connection.once('open', () => {
    console.log('MongoDb connection ready');
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})

async function mongoConnect() {
    // you  might need to add await later on in production 👇👇
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    // you  might need to add await later on in production 👇👇
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}