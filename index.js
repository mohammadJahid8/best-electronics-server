const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());



const verifyToken = (req, res, next) => {
    const headerAuth = req.headers.authorization;
    if (!headerAuth) {
        return res.status(401).send({ message: 'Unauthorized Request' });
    }
    const token = headerAuth.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log(decoded);
        req.decoded = decoded;
        next();
    })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dxcla.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {

    try {
        await client.connect();
        console.log('connect');
        const itemsCollection = client.db("inventory").collection("items");

        app.post('/gettoken', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '15d'
            });
            res.send(token);
        });


        // get all items from database
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

        //update quantity and restock item
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

        //Delete a item
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        });

        //add new item
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const result = await itemsCollection.insertOne(newItem);
            res.send(result);
        })

        //get my item
        app.get('/item', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email };
                const cursor = itemsCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else {
                res.status(403).send({ message: 'Forbidden access' });
            }

        });



    }
    catch (error) {
        console.log('error', error);
    }
}
run();

app.get('/', (req, res) => {
    res.send('welcome to the api');
})

app.listen(port, () => {
    console.log('server is running');
})