const express = require("express");
const cors = require("cors");
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

// Database Connection
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

    app.post("/myReview", async(req, res) => {
      const theReview = req.body;
      const review = await reviewCollection.insertOne(theReview);
      res.send(review)
    })
    
    app.get("/myProfile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myProfile = await profileCollection.findOne(query);
      res.send(myProfile);
    });
    
    app.put("/myProfile/:email", async (req, res) => {
      const myEmail = req.params.email;
      const myUpdatedProfile = req.body;
      const query = { email: myEmail };
      const options = { upsert: true };
      const updatedName = myUpdatedProfile.name;
      const updatedEmail = myUpdatedProfile.email;
      const updatedEducation = myUpdatedProfile.education;
      const updatedLocation = myUpdatedProfile.location;
      const updatedPhone = myUpdatedProfile.phoneNumber;
      const updatedLinkedIn = myUpdatedProfile.linkedInProfile;
      const updateDoc = {
        $set: {
          name: updatedName,
          email: updatedEmail,
          education: updatedEducation,
          location: updatedLocation,
          phoneNumber: updatedPhone,
          linkedInProfile: updatedLinkedIn,
        },
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
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Metal-House Server is Running on the port ${port}`);
});
