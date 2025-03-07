import qrcode from "qrcode-terminal"
import Dify from "./lib/dify.js"; "./lib/dify.js";
import { Client, LocalAuth } from "whatsapp-web.js";
import { saveChatToDB, getChatByClientAndBusinessPhone } from "enwhats-db";
import removeAccents from "./lib/remove-accents.js";
import type { CustomerBusinessNumbers } from "./dto/dify-data-completion.js";

const difyApiKey = process.env['DIFY_API_KEY'] || ''
const difyURL = process.env['DIFY_URL'] || ''

let businessProfile = {
    id: 1,
    name: "Chat Ally",
    phone: "5219995992592@c.us",
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

// Here are a ton of ramifications.
// Things to consider:
//  1. A single user can have conversations with multiple business.
//  2. Dify stores messages, and the database stores our app's data
//  3. We have to sync Dify conversatinos with database chats
whatsapp.on('message', async (msg) => {
    let businessPhone = msg.to
    let customerPhone = msg.from

    // 1. Find if user has any previous conversation in dify
    let customerHasConversations = await dify.userHasConversations(customerPhone)

    // 2. If there are any conversations of this user in dify, check if there is a 
    //    chat/conversation between current user and current business in database
    let previousConversation;
    if (customerHasConversations) previousConversation = await getChatByClientAndBusinessPhone(customerPhone, businessPhone)

    // 3. Send message to to previous conversation (or create a new one)
    let text = removeAccents(msg.body)
    let phones: CustomerBusinessNumbers = {
        businessPhoneNumber: businessPhone,
        customerPhoneNumber: customerPhone
    }
    let difyResponse = await dify.sendMessage(
        text,
        customerPhone,
        previousConversation ? previousConversation.id : undefined, // if previousConversation exists, it's pass it's id, if not, dify creates a new one and returns its id
        phones
    )

    // 4. Save created conversatinos, if it didnt exist
    if (!customerHasConversations) saveChatToDB(businessProfile.id, customerPhone, difyResponse.conversation_id)

    msg.reply(difyResponse.answer)
})

export default whatsapp