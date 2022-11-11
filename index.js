const express = require('express');
const cors = require('cors');
const { query } = require('express');
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
        const bookingCollection = client.db("doctors_portal").collection("bookings");
        app.get('/service', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray()
            res.send(services)
        });
        app.get('/booking',async(req, res)=>{
            const patient = req.query.patient;
            const query = {patient: patient};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)
        })
        app.get('/available',async(req,res)=>{
            const date = req.query.date;
            //Step1: Get all services
            const services = await serviceCollection.find().toArray();

            //Step2: Get the booking of the day
            const query = {date:date};
            const bookings = await bookingCollection.find(query).toArray();

            //Step3:For each service
            services.forEach(service => {
                //Step4: Find booking for that service. output: [{}, {}, {}, {}]
                const serviceBookings = bookings.filter(book => book.treatment === service.name);
                //Step5: select slots for the service Bookings ['','',''];
                const bookedSlots = serviceBookings.map(book => book.slot);
                //Step6: select those slots thats are not in bookedSlots
                const available = service.slots.filter(slot => !bookedSlots.includes(slot));
                //Step7: set available to slots to make 
                service.slots = available;
            })
        })

        app.post('/booking',async(req,res)=>{
            const booking = req.body;
            const query = {treatment:booking.treatment, date:booking.date, patient:booking.patient};
            const exists = await bookingCollection.findOne(query);
            if(exists){
                return res.send({success:false, booking:exists})
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({success:true, result});
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