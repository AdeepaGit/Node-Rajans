const mongoose=require("mongoose"); {/* import mongoose*/}
{/*create variables */}

const MemberDetailsScehma = new mongoose.Schema({
    pTitle: String,
    image:String,
    pDescription: String,

},{
    collection:"MembersPost",
});
mongoose.model("MembersPost",MemberDetailsScehma);