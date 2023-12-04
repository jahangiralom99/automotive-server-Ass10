const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

// middleware configuration
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.USER_PASS}@cluster0.e9wqxpd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const carCollection = client.db("carsDB").collection("cars");
    const addCartCollection = client.db("addCartDB").collection("addCart");

    //   get Cars Data
    app.get("/cars", async (req, res) => {
      const cursor = carCollection.find();
      const query = await cursor.toArray();
      res.send(query);
    });

    //   crete data || POST request:
    app.post("/cars", async (req, res) => {
      const newCars = req.body;
      const result = await carCollection.insertOne(newCars);
      res.send(result);
    });

    // single id for id
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    })


    // update data:
    app.put("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const upDateCars = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const cars = {
        $set: {
          name: upDateCars.name,
          brandName: upDateCars.brandName,
          price: upDateCars.price,
          description: upDateCars.description,
          rating: upDateCars.rating,
          type: upDateCars.type,
          photo: upDateCars.photo,
        }
      };
      const result = await carCollection.updateOne(filter, cars, option);
      res.send(result);
    });

    // addTO card Users;
    app.post('/carts', async (req, res) => {
      const newCart = req.body;
      console.log(newCart);
      const result = await addCartCollection.insertOne(newCart);
      res.send(result);
    });


    // get users
    app.get('/carts', async (req, res) => {
      const cursor = addCartCollection.find();
      const query = await cursor.toArray();
      res.send(query);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to my server");
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
