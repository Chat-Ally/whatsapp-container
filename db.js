const { createClient } = require('@supabase/supabase-js');
const supabaseURL = process.env.SUPABASE_URL
const adminKey = process.env.SUPABASE_ADMIN_KEY

const supabase = createClient(supabaseURL, adminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

/**
 * Saves a chat to the database.
 *
 * @param {string} businessId - The ID of the business associated with the chat.
 * @param {string} customerPhone - The phone number of the customer associated with the chat.
 */
async function saveChatToDB(businessId, customerPhone){
    console.log("businessId", businessId)
    console.log("customerPhone: ", customerPhone)
    let { data, error } = await supabase.from("chats").insert([{business_id: businessId, customer_phone: customerPhone }])
    if(error) console.error(error)
    if(data) console.log(data)
}

module.exports = { saveChatToDB }