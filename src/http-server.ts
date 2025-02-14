import express, { type Express } from "express";
import { getProduct, getProducts } from "./lib/db";

const app: Express = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
    console.log("console")
});

app.get('/products/:business_id', async (req, res) => {
    let business_id = req.params.business_id
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
    res.send({
        product: product
    })
})

export default app