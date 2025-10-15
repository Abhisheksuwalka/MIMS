import dotenv from 'dotenv';
import mongoose from 'mongoose'

dotenv.config();
const uri = process.env.MONGODB_URI;

async function Connect() {
  try {
    await mongoose.connect(uri).then(()=>{console.log("connected to the db. ✅")});

  }catch(err){
    console.log(err);
  }
}

export default Connect;
