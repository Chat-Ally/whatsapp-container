require('dotenv').config();
const express = require('express')
const app = express();
const qrcode = require('qrcode-terminal');
const dify = require('../dify-js/index')
const { Client, LocalAuth } = require('whatsapp-web.js');
const makeConversationId = require('./makeId');
const { saveChatToDB } = require('./db')

const difyApiKey = process.env.DIFY_API_KEY
const difyURL = process.env.DIFY_URL

let businessProfile = {
    id: 1,
    name: "Chat Ally",
    phone: "9995992592",
    email: "chatally@gmail.com"
}

let { sendMessage, deleteConversation, findConversation } = dify(difyURL, difyApiKey)

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client received QR-Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async (msg) => {
    let businessPhone = msg.from
    let customerPhone = msg.to
    let conversationId = makeConversationId(businessPhone, customerPhone)
    let conversation = await findConversation(conversationId)
    if(!conversation) saveChatToDB(businessProfile.id, customerPhone)
    let answer = await sendMessage(msg.body, conversationId)
    msg.reply(answer)
})

// Start your client
client.initialize();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/a', (req, res) => {
    console.log("hola")
    res.send({
        "food": ["frijol con puerco", "pechuga empanizada"]
    })
})

const port = 9590;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});