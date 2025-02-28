import express, { type Express, type Request, type Response } from "express";
import { createOrder, getBusinessIdByPhoneNumber, getChatId, getChats, getProduct, getProducts } from "./lib/db";
import Dify from "./lib/dify";

const app: Express = express();
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/products/:business_id', async (req: Request, res: Response) => {
    let business_id = req.params['business_id']
    console.log('/products/' + business_id)
    let businessPhone = Number(business_id)
    let products = await getProducts(businessPhone)
    res.send({
        "products": products
    })
})

// Here we need to find a product based on the name. We query prouduct names, meaning we cannot have repeated names.
// We can filter via categories. We also need to pull products from the bussiness

app.get('/product/:business_phone/:name', async (req, res) => {
    let { business_phone, name } = req.params
    console.log('/product/' + business_phone + '/' + name)

    let product = await getProduct(Number(business_phone), name)
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
    // in the post body we get the products

    const { customer_phone, business_phone, product_list } = req.body
    console.log('/orders/')
    console.log("product list", product_list, typeof product_list)
    let businessId = await getBusinessIdByPhoneNumber(business_phone)
    let chatId = await getChatId(businessId, customer_phone)
    console.log("chatId", chatId)
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