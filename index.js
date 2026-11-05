import express from  'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
import { createRemoteJWKSet, jwtVerify } from 'jose';
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


const verifyToken = async (req, res, next) => {
      const authHeader = req.headers.authorization
      if(!authHeader){
            return res.status(401).send({ msg: "Unauthorize!" })    
      }

       const token = authHeader.split(" ")[1]
       if(!token){
             return res.status(401).send({ msg: "Unauthorize!" })   
       }
        
      const JWKS = createRemoteJWKSet(new URL('http://localhost:3000/api/auth/jwks'))

      

      try {
            const { payload } = await jwtVerify(token, JWKS)
            next(); 
      } catch (error) {
            return res.status(500).send({ msg: "Server Error!" })  
      }





     
}


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

 app.get('/event/:id',
       verifyToken,   
  async(req, res) => {
          const {id} = req.params
          const result = await eventCollection.findOne({_id:new ObjectId(id)})
          res.send(result)
 })

 //Edit

 app.patch('/event/:id', async (req, res) =>{
      const {id} =req.params
      const updatedData = req.body
      const result = await eventCollection.updateOne(
        {_id: new ObjectId(id)},
            { $set: updatedData }    
      )
      res.status(200).json(result)
 })

 //Delate 

 app.delete('/event/:id', async(req, res) =>{
  const {id} = req.params
  const result = await eventCollection.deleteOne({_id: new ObjectId(id)})
  res.json(result)
 })


//http://localhost:5000

app.get('/', (req, res) => {
          res.send({msg: 'Server is running fine!'})
})

app.listen(port, () => {
          console.log(`SErver is running at ${port}`)
})