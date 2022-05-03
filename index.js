const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxcla.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {

    try {
        await client.connect();


        app.get('/', (req, res) => {
            res.send('welcome to the server')
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