const express = require('express');
const { MongoClient } = require('mongodb');
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
        const itemsCollection = client.db("inventory").collection("items");

        //get all items from database
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
            // console.log(result);
            // console.log('hello');
        })

    }
    catch (error) {
        console.log('error', error);
    }
}
run();



app.listen(port, () => {
    console.log('server is running');
})