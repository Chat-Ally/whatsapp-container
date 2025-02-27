import qrcode from "qrcode-terminal"
import Dify from "./lib/dify.js"; "./lib/dify.js";
import { Client, LocalAuth } from "whatsapp-web.js";
import { saveChatToDB } from "./lib/db.js"
import removeAccents from "./lib/remove-accents.js";

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
    let businessPhone = msg.to
    let customerPhone = msg.from

    let difyConversation = await dify.findConversation(customerPhone) // find conversation in dify database 

    if (!difyConversation) saveChatToDB(businessProfile.id, customerPhone)

    let difyAnswer = await dify.sendMessage(removeAccents(msg.body), customerPhone)
    msg.reply(difyAnswer.answer)
})

export default whatsapp