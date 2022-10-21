const express = require('express');
const cors = require('cors')
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-bmiuboe-shard-00-00.k07wrg5.mongodb.net:27017,ac-bmiuboe-shard-00-01.k07wrg5.mongodb.net:27017,ac-bmiuboe-shard-00-02.k07wrg5.mongodb.net:27017/?ssl=true&replicaSet=atlas-uzdgp2-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri);
async function run() {
    try {
        const serviceCollection = client.db("doctors_portal").collection("services");
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })
        app.post('/booking', async(req,res)=>{
            const booking = req.body;
            const result = await serviceCollection.insertOne(booking);
            res.send(result)
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello Rashedul!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})