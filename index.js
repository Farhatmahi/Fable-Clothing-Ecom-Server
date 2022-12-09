const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")('sk_test_51M7FK2JH0OzhgIOypLPiR4IkzIxEiaEwUHbNstAppIq60w9A0QLO1ANtwnkYnWvJwQNXfShW3lGyGx2U1p9Uod5i00XPa6yZpe')

//middleware
app.use(cors());
app.use(express.json());

//PORT
const port = process.env.PORT || 1000;

//mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://fable:fable@cluster0.6ulnnbw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//collections
const allProductsCollection = client.db("fable").collection("allProducts");
const userCollection = client.db("fable").collection("users");
const cartCollection = client.db("fable").collection("cart");
const purchasedCollection = client.db('fable').collection('purchased-collection')
const paymentCollection = client.db("fable").collection("payment");

const run = async () => {
  //get all products
  app.get("/all-products", async (req, res) => {
    const query = {};
    const products = await allProductsCollection.find(query).toArray();
    res.send(products);
  });

  //get products by category
  app.get("/all-products/:type", async (req, res) => {
    const type = req.params.type;
    const query = { product_type: type };
    const result = await allProductsCollection.find(query).toArray();
    res.send(result);
  });

  //get product by id
  app.get("/product/:id", async (req, res) => {
    // console.log(req);
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    // console.log(query);
    const result = await allProductsCollection.findOne(query);
    res.send(result);
  });

  app.get("/users", async (req, res) => {
    const query = {};
    const users = await userCollection.find(query).toArray();
    res.send(users);
  });

  app.get("/cart", async (req, res) => {
    const query = {};
    const result = await cartCollection.find(query).toArray();
    res.send(result);
  });

  app.get("/cartFilteredByUser", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await cartCollection.find(query).toArray();
    res.send(result);
  });

  //post : users
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await userCollection.insertOne(user);
    res.send(result);
  });

  //adding to cart
  app.post("/cart", async (req, res) => {
    const cart = req.body;
    const query = {
      email: cart.email,
      product_name: cart.product_name,
    };

    const alreadyInCart = await cartCollection.find(query).toArray();
    if (alreadyInCart.length) {
      const message = `Product already added on cart`;
      return res.send({ acknowledged: false, message });
    }
    const result = await cartCollection.insertOne(cart);
    res.send(result);
  });

  //payment
  app.post("/create-payment-intent", async (req, res) => {
    const order = req.body;
    const price = order.price;
    const amount = price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: amount,
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });

  app.post('/payment', async(req, res) => {
    const payment = req.body;
    const result = await paymentCollection.insertOne(payment)
    const id = payment.purchased_Id;
    const query = {_id : ObjectId(id)}
    const updatedDoc = {
      $set : {
        paid : true,
        transactionId : payment.transactionId
      }
    }
    const updateResult = await purchasedCollection.updateOne(query, updatedDoc)
    res.send(result)
  })

  app.get('/payment', async(req, res) => {
    const query = {}
    const result = await paymentCollection.find(query).toArray()
    res.send(result)
  })





};
run().catch((err) => console.log(err));

//app running
app.get("/", (req, res) => {
  res.send("Fable server is running");
});

//app listener
app.listen(port, () => {
  console.log(`Fable is running on ${port}`);
});
