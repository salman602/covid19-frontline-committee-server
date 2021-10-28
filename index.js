const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = 5000;

//Middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2tgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db("medicalBoard");
        const doctorsCollection = database.collection("doctors");

        // GET API
        app.get('/doctors', async (req, res)=>{
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            res.send(doctors)
        })

        app.get('/doctors/:id', async (req, res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const doctor = await doctorsCollection.findOne(query);
            res.json(doctor);
        })

        // POST API
        app.post('/doctors', async (req, res)=>{
            console.log(req.body);
            const doctor = req.body;
            const result = await doctorsCollection.insertOne(doctor);
            res.json(result);
        })

        // UPDATE API
        app.put('/doctors/:id', async(req, res) =>{
            const id = req.params.id;
            console.log('updating id ',id);
            const updatedDoctor = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    name: updatedDoctor.name,
                    fee: updatedDoctor.fee
                  },
            };
            const result = await doctorsCollection.updateOne(filter, updateDoc, options);
            res.json(result)
            
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir)

app.get('/', (req, res)=>{
    res.send('Running on the server.');
});

app.listen(port, ()=>{
    console.log(`Server is Running on port ${port}`)
});