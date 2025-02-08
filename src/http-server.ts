import express, { type Express } from "express";

const app: Express = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
    console.log("console")
});

// get data
app.get('/a', (req, res) => {
    console.log("hola")
    res.send({
        "food": ["frijol con puerco", "pechuga empanizada"]
    })
})

export default app