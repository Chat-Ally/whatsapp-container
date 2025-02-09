import express, { type Express } from "express";
import { getProducts } from "./lib/db";

const app: Express = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
    console.log("console")
});

app.get('/products/:conversation', async (req, res) => {
    let conversationId = req.params.conversation
    let businesPhone = conversationId.split("@")[1]
    let businessPhone = Number(businesPhone)
    let products = await getProducts(businessPhone)
    console.log(products)
    res.send({
        "products": products
    })
})

export default app