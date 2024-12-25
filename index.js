const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
// carRental
// Ador123
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krhx2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const carsCollection = client.db("car-rental").collection("cars");
  const bookCollection = client.db("car-rental").collection("booked");
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // cars apis
    app.post("/add-car", async (req, res) => {
      const newCar = req.body;
      console.log(newCar);
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });
    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });
    // gett all  posted by specific user
    app.get("/myposted/:email", async (req, res) => {
      const email = req.params.email;

      const query = { hrEmail: email };
      // console.log(query)
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });
    // posted Car delete
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });
    // put upadte
    app.put("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const carData = req.body;
      const updated = {
        $set: carData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await carsCollection.updateOne(query, updated, options);
      res.send(result);
    });

    // booked collection api
    app.post("/add-booked", async (req, res) => {
      const bookedData = req.body;
      console.log(bookedData);
      const result = await bookCollection.insertOne(bookedData);

      const filter = { _id: new ObjectId(bookedData.carId) };
      const update = {
        $inc: { count: 1 },
      };
      const updateCount = await carsCollection.updateOne(filter, update);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ph-assaignment-11 server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
