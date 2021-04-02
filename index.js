const express = require('express');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdusz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const gearsCollection = client.db(`${process.env.DB_NAME}`).collection("gears");
    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
    console.log('connection err', err)
    app.get('/', (req, res) => {
        res.send('Server Running');
    });

    app.get('/gears', (req, res) => {
        gearsCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/gear/:id', (req, res) => {
        gearsCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.get('/orders/:email', (req, res) => {
        ordersCollection.find({ email: req.params.email })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err)
            })
    })

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addGear', (req, res) => {
        const newGear = req.body;
        gearsCollection.insertOne(newGear)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.delete('/deleteGear/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        gearsCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
    })

});

app.listen(process.env.PORT || '3001');