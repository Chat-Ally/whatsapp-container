import qrcode from "qrcode-terminal"
import Dify from "dify-js"
import { Client, LocalAuth } from "whatsapp-web.js";
import { saveChatToDB, getChatByClientAndBusinessPhone } from "enwhats-db";
import removeAccents from "./lib/remove-accents.js";
import type { CustomerBusinessNumbers } from "./dto/dify-data-completion.js";
import { createClient } from "@supabase/supabase-js";

const difyApiKey = process.env['DIFY_API_KEY'] || ''
const difyURL = process.env['DIFY_URL'] || ''
const supabaseURL = process.env['SUPABASE_URL'] || ''
const supabaseKey = process.env['SUPABASE_ADMIN_KEY'] || ''
const businessId = process.env['BUSINESS_ID'] || ''

if (!difyApiKey || !difyURL || !supabaseURL || !supabaseKey || !businessId) {
    throw new Error("Environmen variable missing")
}
/* let businessProfile = {
    id: 1,
    name: "Chat Ally",
    phone: "5219995992592@c.us",
    email: "chatally@gmail.com"
} */

const supabase = createClient(supabaseURL, supabaseKey)
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
whatsapp.on('qr', async (qr) => {
    let { data, error } = await supabase.from("whatsapp-containers")
        .upsert([{
            business_id: businessId,
            qr: qr
        }],
            {
                count: "estimated",
            }
        )

    if (error) console.error(error)
    if (data) console.log('data: ', data)
    qrcode.generate(qr, { small: true });
});

whatsapp.on('authenticated', async () => {
    let { data, error } = await supabase
        .from("whatsapp-containers")
        .update({
            status: "authenticated"
        })
        .eq("business_id", businessId)

    if (error) console.error(error)
})

// Here are a ton of ramifications.
// Things to consider:
//  1. A single user can have conversations with multiple business.
//  2. Dify stores messages, and the database stores our app's data
//  3. Dify is what generates conversation IDs
//  4. We have to sync Dify conversatinos with database chats
whatsapp.on('message', async (msg) => {
    let businessPhone = msg.to
    let customerPhone = msg.from

    // 1. Find if user has any previous conversation in dify
    let customerHasDifyConversations = await dify.userHasConversations(customerPhone)

    // 2. If there are any conversations of this user in dify, check if there is a 
    //    chat/conversation between current user and current business in database
    let previousSupabaseConversation;
    if (customerHasDifyConversations) {
        previousSupabaseConversation = await getChatByClientAndBusinessPhone(
            supabase,
            customerPhone,
            businessPhone
        )
    }

    // 3. Send message to to previous conversation (or create a new one)
    let text = removeAccents(msg.body)
    let phones: CustomerBusinessNumbers = {
        businessPhoneNumber: businessPhone,
        customerPhoneNumber: customerPhone
    }
    let difyResponse = await dify.sendMessage(
        text,
        customerPhone,
        previousSupabaseConversation ? previousSupabaseConversation.id : undefined, // if previousConversation exists, it's pass it's id, if not, dify creates a new one and returns its id
        phones
    )

    // 4. Save created conversation, if it didnt exist
    if (!previousSupabaseConversation) {
        console.log('saving new conversation to supabse')
        saveChatToDB(
            supabase,
            Number(businessId),
            customerPhone,
            difyResponse.conversation_id
        )
    }

    msg.reply(difyResponse.answer)
})

export default whatsapp