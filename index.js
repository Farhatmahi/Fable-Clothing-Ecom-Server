const express = require("express")
const app = express()
const cors = require('cors')


//middleware
app.use(cors())
app.use(express.json())


//PORT
const port = process.env.PORT || 1000;



//mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://fable:fable@cluster0.6ulnnbw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//collections
const allProductsCollection = client.db('fable').collection('allProducts')
const userCollection = client.db('fable').collection('users')

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

    //get product by id
    app.get('/product/:id', async(req, res) => {
        console.log(req);
        const id = req.params.id;
        const query = { _id : ObjectId(id)}
        console.log(query);
        const result = await allProductsCollection.findOne(query)
        res.send(result)
    })

    app.get('/users', async(req, res) => {
        const query = {}
        const users = await userCollection.find(query).toArray()
        res.send(users)
      })

    //post : users
    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await userCollection.insertOne(user)
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