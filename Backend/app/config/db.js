const mongoose = require('mongoose');


const dbConnect  = async()=>{
   try{
       const res = await mongoose.connect(process.env.MONGO_DB_URL);
       console.log(`MongoDB Connected: ${res.connection.host}`);
   }
   catch(err){
     console.log(err)
   }
}

module.exports = dbConnect