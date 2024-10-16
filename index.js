const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, Timestamp, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

const stripe = require('stripe')(process.env.STRIPE_SECRET);

//Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status('401').send({ message: 'Invalid token' })
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) return res.status('403').send({ message: 'Token is not valid' })
      req.user = decoded
      next()
    })
  }

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mmutbdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //  await client.connect();

    // Send a ping to confirm a successful connection

    const userCollection = client.db('BiteDelight').collection('User');
    const foodCollection = client.db('BiteDelight').collection('Foods');
    const ratingCollection = client.db('BiteDelight').collection('Rating');
    const cartCollection = client.db('BiteDelight').collection('Cart');
    const paymentCollection = client.db('BiteDelight').collection('Payment');

    app.get('/', async (req, res) => {
      res.send('Server is Running')
    })

    app.get('/ratings', async (req, res) => {
      const ratings = await ratingCollection.find({}).toArray();
      res.send(ratings)
    })

    app.get('/all-users', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users)
    })

    app.get('/all-food', async (req, res) => {
      const ratings = await foodCollection.find().toArray();
      res.send(ratings)
    })

    //Stripe
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price*100);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
       payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    app.post('/payments',async(req,res)=>{
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      const query = {_id:{$in: payment.cartId.map(x =>x)}}
      const deleteResult = await cartCollection.deleteMany(query);
      res.send({paymentResult,deleteResult})
    })



    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '7d' })
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
      }).send({ message: 'Cookie set Done' })
    })

    app.get('/remove_cookie', async (req, res) => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0
      }).send({ message: 'Removed Cookie' })
    })

    app.put('/user', async (req, res) => {
      const user = req.body;
      const isExist = await userCollection.findOne({ email: user?.email })
      if (isExist) return res.send(isExist)
      const options = { upsert: true }
      const query = { email: user.email }
      const updateDocs = {
        $set: {
          ...user,
          Timestamp: Date.now()
        }
      }
      const result = await userCollection.updateOne(query, updateDocs, options)
      res.send(result)
    })

    app.post('/cart', async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result)
    })

    app.get('/cartInfo/:email', async (req, res) => {
      const email = req.params.email;
      const cart = await cartCollection.find({ email }).toArray();
      res.send(cart)
    })

    app.delete('/cartData/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await cartCollection.deleteOne({ _id: id }); // No ObjectId conversion
      res.send(result);
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})