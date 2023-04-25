const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Metal House");
});

// Database Connection.
// 21st January - Resuming the Database Connection.
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xlwxjjl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    const toolCollection = client.db("metalHouse").collection("tools");
    const orderCollection = client.db("metalHouse").collection("orders");
    const reviewCollection = client.db("metalHouse").collection("reviews");
    const profileCollection = client.db("metalHouse").collection("profiles");

    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tool = await cursor.toArray();
      res.send(tool);
    });

    app.get("/tools/:id", async (req, res) => {
      const toolId = req.params.id;
      const query = { _id: ObjectId(toolId) };
      const tool = await toolCollection.findOne(query);
      res.send(tool);
    });

    app.post("/orders", async (req, res) => {
      const placeOrder = req.body;
      const theOrder = await orderCollection.insertOne(placeOrder);
      res.send(theOrder);
    });

    app.get("/myOrders", async (req, res) => {
      const email = req.query.userEmail;
      if (email) {
        const query = { userEmail: email };
        const cursor = orderCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      }
    });

    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/myOrders/:id", async (req, res) => {
      const myOrderId = req.params.id;
      const query = { _id: ObjectId(myOrderId) };
      const myOrder = await orderCollection.findOne(query);
      res.send(myOrder);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const product = req.body;
      const payable = product.orderPayable;
      const payableAmount = payable * 100;
      // console.log(product, payable, payableAmount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: payableAmount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });

    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const myTransection = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const myTransectionId = myTransection.transectionId;
      const updateDoc = {
        $set: {
          orderStatus: "pending",
          transactionId: myTransectionId,
        },
      };

      const result = await orderCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.post("/myReview", async (req, res) => {
      const theReview = req.body;
      const review = await reviewCollection.insertOne(theReview);
      res.send(review);
    });

    app.get("/myProfile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myProfile = await profileCollection.findOne(query);
      res.send(myProfile);
    });

    app.put("/profile/:email", async (req, res) => {
      const myEmail = req.params.email;
      const currentProfile = req.body;
      const query = { email: myEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: currentProfile,
      };

      const result = await profileCollection.updateOne(
        query,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: myEmail },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    app.put("/myProfile/:email", async (req, res) => {
      const myEmail = req.params.email;
      const currentProfile = req.body;
      const query = { email: myEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: currentProfile,
      };

      const result = await profileCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.post("/tools", async (req, res) => {
      const theTool = req.body;
      const tool = await toolCollection.insertOne(theTool);
      res.send(tool);
    });

    app.delete("/tool/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.put("/shippedOrder/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const newOrderStatus = status.orderStatus;
      const updateDoc = {
        $set: {
          orderStatus: newOrderStatus,
        },
      };

      const result = await orderCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.get("/profiles", async (req, res) => {
      const query = {};
      const cursor = profileCollection.find(query);
      const profiles = await cursor.toArray();
      res.send(profiles);
    });

    app.put("/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const accessLevel = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const newAccessLevel = accessLevel.access;
      const updateDoc = {
        $set: {
          access: newAccessLevel,
        },
      };

      const result = await profileCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(`Metal-House Server is Lestning on the port ${port}`);
});

app.listen(port, () => {
  console.log(`Metal-House Server is Lestning on the port ${port}`);
});
