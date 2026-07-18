import mongoose from "mongoose";
const meetingSchema=({
    user_id:{type:String},
    meetingCode:{type:String,required:true},
    date:{type:Date,default:Date.now,required:true}
})
const Meeting=mongoose.model("Meeting",meetingSchema);
export{Meeting};