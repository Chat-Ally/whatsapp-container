import { createClient } from "@supabase/supabase-js"
import type PhoneNumber from "../dto/phone-number"
import type { UUID } from "crypto"
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
export async function saveChatToDB(businessId: number, customerPhone: string, chatId: string) {
    console.log("saveChatToDB")
    let phoneNumber = await getOrCreatePhoneNumber(customerPhone)
    console.log("chatId", chatId)
    if (phoneNumber) {
        let { data, error } = await supabase
            .from("chats")
            .insert([{
                id: chatId,
                business_id: businessId,
                customer_phone_id: phoneNumber.id
            }])
        if (error) console.error('saveChatToDB', error)
        if (data) {
            console.log(data)
        }
    }
}

/** 
 * Save a number to the database.
 *
 * @param {string} customerPhone - A phone number from a customer.
*/
export async function getOrCreatePhoneNumber(customerPhone: string): Promise<PhoneNumber | undefined> {
    let { data: phone, error: phoneError } = await supabase
        .from("phones")
        .select("*")
        .eq("number", customerPhone)
        .single()
    if (phoneError) console.error('getOrCreatePhoneNumber', phoneError)
    if (phone) {
        // console.log("getOrCreatePhoneNumber", phone)
        return phone
    } else {
        let { data, error } = await supabase
            .from("phones")
            .upsert([{ number: customerPhone }])
            .select()
        if (error) console.error('getOrCreatePhoneNumber', error)
        if (data) {
            return data[0]
        }
    }
}

/**
 * Retrieves products from the database based on a business phone number.
 *
 * @param {number} businessPhone - The phone number of the business associated with the products.
 * @returns {(Promise<Product[] | null>)} A promise that resolves to an array of Product objects or null if an error occurs.
 */
export async function getProducts(businessPhone: string) {
    let businessId = await getBusinessIdByPhoneNumber(businessPhone)
    let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .limit(5)
    if (error) console.error('getProducts', error)
    return data
}

/**
 * Retrieves a single product from the database based on a business phone number and product name.
 *
 * @param {number} businessPhone - The phone number of the business associated with the product.
 * @param {string} productName - The name of the product to retrieve.
 * @returns {(Promise<Product | null>)} A promise that resolves to a Product object or null if an error occurs.
 */
export async function getProduct(businessPhone: string, productName: string) {
    let businessId = await getBusinessIdByPhoneNumber(String(businessPhone))
    let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .ilike("name", `${productName}%`)
        .single()
    if (error) console.error('getProduct', error)
    console.log(data)
    return data
}

/**
 * Fetches the business ID associated with a given phone number.
 *
 * @param {number} businessPhone - The phone number of the business to retrieve.
 * @returns {Promise<number>} A promise that resolves to the business ID if found, or 0 if not found.
 */
export async function getBusinessIdByPhoneNumber(businessPhone: string): Promise<number> { // i probably break something
    let { data, error } = await supabase
        .from("business")
        .select("id")
        .eq("phone", businessPhone)
        .single()
    if (error) console.error('getBusinessIdByPhoneNumber', error)
    if (!data || data == null) return 0

    console.log('getBusinessIdByPhone', data)

    return data && data.id as number
}

export async function getChatByClientAndBusinessPhone(
    customerPhone: string,
    businessPhone: string
): Promise<any> {
    let customerPhoneId = await getPhoneIdByNumber(customerPhone)
    let businesId = await getBusinessIdByPhoneNumber(businessPhone)

    let { data: chats, error: chatsError } = await supabase
        .from("chats")
        .select("*")
        .eq("customer_phone_id", String(customerPhoneId),)
        .eq("business_id", String(businesId),)
        .single()

    if (chatsError) console.error('getChatByClientAndBusinessPhone', chatsError)

    return chats
}

export async function getPhoneIdByNumber(phoneNumber: string): Promise<number | null> {
    let { data, error } = await supabase
        .from("phones")
        .select("*")
        .eq("number", phoneNumber)
        .single()
    if (error) console.error('getPhoneIdByNumber', error)

    return data.id
}

/**
 * Creates a new order in the database.
 *
 * This function inserts a new record into the 'orders' table using the specified 
 * `chat_id`, `total`, and `subtotal`. The function returns an array of inserted records 
 * or undefined if there's an error during insertion.
 *
 * @param {string} chat_id - A unique identifier for the chat session associated with the order. It includes both the business and the client, split by an @.
 * @param {number} total - The total amount of the order, including any taxes and fees.
 * @param {number} subtotal - The base price of the goods/services ordered, before tax or additional fees are applied.
 * @param {number[]} products - The list product ids that the user added to his order.
 * 
 * @returns {Promise<any[]> | undefined} An array containing the newly inserted record(s) upon successful insertion. 
 * If an error occurs during the database operation, it logs the error to the console and returns `undefined`.
 */
export async function createOrder(
    chat_id: UUID,
    total: number,
    subtotal: number,
    products: number[]
): Promise<any> {
    const { data, error } = await supabase
        .from('orders')
        .insert([
            {
                chat_id: chat_id,
                total: total,
                subtotal: subtotal
            },
        ])
        .select()

    if (error) console.error('createOrder', error)
    if (data) {
        console.log("createOrder", data)
        console.log("createOrder products", products)
        createProductOrder(products, data[0].id)
    }
    return data
}

export async function createProductOrder(products: number[], orderId: number) {
    const inserts = products.map(num => ({
        product_id: num,
        order_id: orderId,
        quantity: 0
    }))

    const { data, error } = await supabase
        .from('product_order')
        .insert(inserts)
        .select()

    if (error) console.error('createProductOrder', error)
    return data
}

export async function getChatId(businessId: number, customerPhoneId: number | null) {
    const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("business_id", businessId)
        .eq("customer_phone_id", customerPhoneId)
        .single()

    if (error) console.error('getChatId', error)

    return data?.id
}

export async function getChats() {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .limit(10)

    if (error) console.error('getChats', error)

    return data
}