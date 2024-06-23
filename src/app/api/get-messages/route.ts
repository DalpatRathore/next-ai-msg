import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/config/db-connect";
import UserModel from "@/model/user";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request:Request){
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  const user: User = session?.user as User;

  if(!session || !session.user){

    return Response.json({
      sucess:false,
      message:"Not Authenitcated"
    },{
      status:401
    })
  }
  const userId = new mongoose.Types.ObjectId(user._id);
  try {

    const user = await UserModel.aggregate([
        {$match:{_id:userId}},
        {$unwind:'$messages'},
        {$sort:{'messages.createdAt':-1}},
        {$group:{_id:'$_id', messages:{$push:'$messages'}}}
    ]);

    if(!user || user.length ===0){
        return Response.json({
            sucess:false,
            message:"User not found"
          },{
            status:404
          })

    }

    return Response.json({
        sucess:true,
        messages:user[0].messages,
      },{
        status:200
      })
    
  } catch (error) {
    console.log("Failed to fetch messages")
    return Response.json({
      sucess:false,
      message:"User not found"
    },{
      status:500
    })
    
  } 
}