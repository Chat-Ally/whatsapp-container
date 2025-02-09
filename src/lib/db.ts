import { createClient } from "@supabase/supabase-js"
const supabaseURL: string = process.env["SUPABASE_URL"] || ''
const adminKey = process.env["SUPABASE_ADMIN_KEY"] || ''

if (!supabaseURL || !adminKey) {
    throw new Error("Keys missing")
}

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
export async function saveChatToDB(businessId: number, customerPhone: string) {
    let { data, error } = await supabase.from("chats").insert([{ business_id: businessId, customer_phone: customerPhone }])
    if (error) console.error(error)
    if (data) console.log(data)
}

export async function getProducts(businessPhone: number) {
    let businessId = await getBusinessByPhone(businessPhone)
    let { data, error } = await supabase.from("products").select("*").eq("business_id", businessId).limit(5)
    if (error) console.error(error)
    return data
}

export async function getBusinessByPhone(businessPhone: number): Promise<number> {
    console.log("businessPhone", businessPhone)
    let { data, error } = await supabase.from("business").select("id").eq("phone", businessPhone)
    if (error) console.error(error)
    if (!data || data == null) return 0
    console.log(data)
    return data && data[0].id as number
}