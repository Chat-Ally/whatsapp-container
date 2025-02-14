import qrcode from "qrcode-terminal"
import Dify from "./lib/dify.js"; "./lib/dify.js";
import { Client, LocalAuth } from "whatsapp-web.js";
import { makeConversationId } from "./lib/makeId.js";
import { saveChatToDB } from "./lib/db.js"

const difyApiKey = process.env['DIFY_API_KEY'] || ''
const difyURL = process.env['DIFY_URL'] || ''

let businessProfile = {
    id: 1,
    name: "Chat Ally",
    phone: "9995992592",
    email: "chatally@gmail.com"
}

let dify = new Dify(difyURL, difyApiKey)

// Create a new client instance
const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// When the client is ready, run this code (only once)
whatsapp.once('ready', () => {
    console.log('Client is ready!');
});

// When the client received QR-Code
whatsapp.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

whatsapp.on('message', async (msg) => {
    let businessPhone = msg.from
    let customerPhone = msg.to
    let conversationId = makeConversationId(businessPhone, customerPhone)
    let conversation = await dify.findConversation(conversationId)
    if (!conversation) saveChatToDB(businessProfile.id, customerPhone)
    let answer = await dify.sendMessage(msg.body, conversationId)
    msg.reply(answer)
})

export default whatsapp