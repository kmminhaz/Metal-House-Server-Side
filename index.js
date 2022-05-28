const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

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
      if(email){
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
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Metal-House Server is Running on the port ${port}`);
});
