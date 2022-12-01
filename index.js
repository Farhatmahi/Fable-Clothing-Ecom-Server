const express = require("express")
const app = express()
const cors = require('cors')


//middleware
app.use(cors())
app.use(express.json())


//PORT
const port = process.env.PORT || 1000;



//mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://fable:fable@cluster0.6ulnnbw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//collections
const allProductsCollection = client.db('fable').collection('allProducts')

const run = async() => {
    //get all products
    app.get('/all-products', async(req, res) => {
        const query = {}
        const products = await allProductsCollection.find(query).toArray()
        res.send(products)
    })

    //get products by category
    app.get('/all-products/:type', async(req, res) => {
        const type = req.params.type;
        const query = {product_type : type}
        const result = await allProductsCollection.find(query).toArray()
        res.send(result)
    })

}
run().catch(err => console.log(err))





//app running 
app.get('/', (req, res) => {
    res.send("Fable server is running")
})


//app listener
app.listen(port, () => {
    console.log(`Fable is running on ${port}`)
})