const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
const app = express()
const port = 5000 || process.env.PORT

app.use(express.json())
app.use(cors())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB}:${process.env.password}@cluster0.hwuf8vx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const DB= client.db('BLOGS-DB')
    const userCollection=DB.collection('users')
    const blogsCollection=DB.collection('blogs')



    app.post('/api/v1/register',async(req,res)=>{
        const {name,photo,email,password}=req.body;
        const existing= await userCollection.findOne({email:email});
        if (existing) {
           return res.status(401).send({message:'user already exist'}) 
        }

        const hashpassword= await bcrypt.hash(password,10)

        const user={
            name:name,
            password:hashpassword,
            email:email,
            photo:photo
        }

        await userCollection.insertOne(user)

        res.status(200).send({
            status:true
        })
    })



   app.post('/api/v1/login',async(req,res)=>{
      const {email,password}=req.body;
      const user= await userCollection.findOne({email:email})
      if (!user) {
        return res.status(401).send({message:'invalid Your Email And Password '})
      }

      const isPassword= await bcrypt.compare(password,user.password)
      if (!isPassword) {
        return res.status(401).send({message:'invalid Your Email And Password '})
      }

      const token = jwt.sign({name:user.name,email:user.email,photo:user.photo},process.env.Secret_Token,{
        expiresIn:'10d'
      })

      res.status(200).send({
        status:true,
        token
      })
   })




app.post('/api/v1/blogs',async(req,res)=>{
  const blogs= req.body;

  await blogsCollection.insertMany(blogs)
 res.send({message:'blogs submited'})
})

app.get('/api/v1/blogs',async(req,res)=>{
  const result= await blogsCollection.find().toArray()
 res.send(result)
})
app.get('/api/v1/blogs/:id',async(req,res)=>{
  const id= req.params.id
  const result= await blogsCollection.findOne({_id:new ObjectId(id)})
 res.send(result)
})




    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
}) 