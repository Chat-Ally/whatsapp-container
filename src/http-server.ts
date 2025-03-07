import express, { type Express, type Request, type Response } from "express";
import { createOrder, getChatId, getChats, getPhoneIdByNumber, getProduct, getProducts } from "enwhats-db"
import Dify from "./lib/dify";
import { getBusinessIdByPhoneNumber } from "enwhats-db/src/business";

const app: Express = express();
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/products/:business_phone', async (req: Request, res: Response) => {
    let business_phone = req.params['business_phone']
    let products = await getProducts(business_phone)
    res.send({
        "products": products
    })
})

// Here we need to find a product based on the name. We query prouduct names, meaning we cannot have repeated names.
// We can filter via categories. We also need to pull products from the bussiness

app.get('/product/:business_phone/:name', async (req, res) => {
    let { business_phone, name } = req.params
    console.log('/product/' + business_phone + '/' + name)

    let product = await getProduct(business_phone, name)
    if (product == null) {
        res.status(400).send({
            product: null
        })
    }
    res.send(product)
})

app.get('/chats', async (req: Request, res: Response) => {
    console.log('/orders')
    const chats = await getChats()
    res.send(chats)
})

app.post('/orders', async (req: Request, res: Response) => {
    console.log('POST /orders')
    const { customer_phone, business_phone, product_list } = req.body

    let businessId = await getBusinessIdByPhoneNumber(business_phone)
    let customerPhoneId = await getPhoneIdByNumber(customer_phone)
    let chatId = await getChatId(businessId, customerPhoneId)
    let order = await createOrder(chatId, 100, 80, JSON.parse(product_list))

    res.send({
        "status": "complete",
        "customer_phone": customer_phone,
        "business_phone": business_phone,
        "order": order
    })
})

app.get('/messages/:user_id', async (req: Request, res: Response) => {
    const difyApiKey = process.env['DIFY_API_KEY'] || ''
    const difyURL = process.env['DIFY_URL'] || ''

    // if we ever rewrite this code, make dify a singleton
    let dify = new Dify(difyURL, difyApiKey)

    let { user_id } = req.params
    let messages = await dify.getConversationHistoryMessages(user_id)

    res.send(messages)
})

app.get('/chats/delete/:conversation_id/:user_id', async (req: Request, res: Response) => {
    const difyApiKey = process.env['DIFY_API_KEY'] || ''
    const difyURL = process.env['DIFY_URL'] || ''

    // if we ever rewrite this code, make dify a singleton
    let dify = new Dify(difyURL, difyApiKey)

    let { conversation_id, user_id } = req.params

    let result = await dify.deleteConversation(conversation_id, user_id)
    res.send(result)
})

export default app 