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
}

/**
 * Retrieves products from the database based on a business phone number.
 *
 * @param {number} businessPhone - The phone number of the business associated with the products.
 * @returns {(Promise<Product[] | null>)} A promise that resolves to an array of Product objects or null if an error occurs.
 */
export async function getProducts(businessPhone: number) {
    let businessId = await getBusinessIdByPhone(businessPhone)
    let { data, error } = await supabase.from("products").select("*").eq("business_id", businessId).limit(5)
    if (error) console.error(error)
    return data
}

/**
 * Retrieves a single product from the database based on a business phone number and product name.
 *
 * @param {number} businessPhone - The phone number of the business associated with the product.
 * @param {string} productName - The name of the product to retrieve.
 * @returns {(Promise<Product | null>)} A promise that resolves to a Product object or null if an error occurs.
 */
export async function getProduct(businessPhone: number, productName: string) {
    let businessId = await getBusinessIdByPhone(businessPhone)
    let { data, error } = await supabase.from("products").select("*").eq("business_id", businessId).eq("name", productName).single()
    if (error) console.error(error)
    console.log(data)
    return data
}

/**
 * Fetches the business ID associated with a given phone number.
 *
 * @param {number} businessPhone - The phone number of the business to retrieve.
 * @returns {Promise<number>} A promise that resolves to the business ID if found, or 0 if not found.
 */
export async function getBusinessIdByPhone(businessPhone: number): Promise<number> {
    let { data, error } = await supabase.from("business").select("id").eq("phone", businessPhone)
    if (error) console.error(error)
    if (!data || data == null) return 0
    return data && data[0].id as number
}