import express from  'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
          try {
                    await client.connect();
                    console.log("You successfully connected to MongoDB!");
                    return client;
          } catch (err) {
                    console.dir(err);
          }
}

const mongoClient =await connectToMongoDB();
const db = mongoClient.db("somaj")
const eventCollection =db.collection("event")


 app.post('/event', async(req, res) =>{
    const data = req.body
    const result = await eventCollection.insertOne(data) 
    console.log(result)      
          res.send(result)
 });

 app.get('/events', async(req,res) => {
          const result = await eventCollection.find().toArray()
          res.send(result)
          
 })

 app.get('/event/:id', async(req, res) => {
          const {id} = req.params
          const result = await eventCollection.findOne({_id:new ObjectId(id)})
          res.send(result)
 })


//http://localhost:5000

app.get('/', (req, res) => {
          res.send({msg: 'Server is running fine!'})
})

app.listen(port, () => {
          console.log(`SErver is running at ${port}`)
})