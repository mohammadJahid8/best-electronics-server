const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxcla.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {

    try {
        await client.connect();
        console.log('connect');
        const itemsCollection = client.db("inventory").collection("items");

        app.get('/', (req, res) => {
            res.send('inside')
            console.log('inside');
        })

        //get all items from database
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        //get single item
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        });

        //update quantity of item
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id;
            const newItem = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: newItem.quantity
                }
            };
            const result = await itemsCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });

        //     }
        //     // finally {

    }
    catch (error) {
        console.log('error', error);
    }
}
run();



app.listen(port, () => {
    console.log('server is running');
})