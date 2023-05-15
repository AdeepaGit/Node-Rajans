  const express = require("express");
  const app = express();
  const mongoose=require("mongoose");
  app.use(express.json())
  const cors = require("cors");
  app.use(cors());
  const bcrypt = require("bcryptjs");
  app.set("view engine","ejs");
  app.use(express.urlencoded({extended:false}));

  const jwt = require("jsonwebtoken");
  var nodemailer = require('nodemailer'); 
  const JWT_SECRET= "ansdniuwndiu323793@ihbsid{}bhbad8789*&9"

const mongoUrl="mongodb+srv://lionsapp:mTG8EA9eH4sWYtYJ@cluster0.elrsdcj.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(mongoUrl,{
  useNewUrlParser:true
}).then(()=>{console.log("connected to db");})
.catch(e=>console.log(e))

{/* import shcema */}
require("./userDetails");
require("./memberPost");
const User = mongoose.model("UserInfo");
const Member = mongoose.model("MembersPost");

{/*create API for register */}
app.post("/register",async(req,res)=>{
  const {fname,lname,email,password,userType} = req.body;
  const encryptedPsaaword = await bcrypt.hash(password,10);
  try {
    const oldUser = await User.findOne({email});
    if(oldUser){
     return res.send({ error: "User exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: encryptedPsaaword,
      userType,
    });
    res.send({status:"ok"});
  } catch (error) {
    res.send({status:"error"});
  }
});

{/*create API for Login */}
app.post("/login-user",async(req,res)=>{

  const {email,password} =req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.send({ error: "User Not Found"});
  }
  if (await bcrypt.compare(password,user.password)){
    const token =jwt.sign({email:user.email},JWT_SECRET,{
      expiresIn:1500,
    });
    

    if(res.status(201)){
      return res.json({status:"ok",data:token});
    
    }else{
      return res.json({error:"error"});
    }
  }
  res.json({status:"error", error: "Inalid Password"});  
});

{/*create API for User Data */}
app.post("/userData",async (req,res)=>{
  const {token} = req.body;
  try {
   const user = jwt.verify(token,JWT_SECRET,(err,res) =>{
    console.log(err,"error");
    console.log(res, "result");
    if(err){
      return "token expired";
    }
    return res;
   });
   console.log(user);
    if(user == "token expired"){
      return res.send({status: "error", data:"token expired"});
    }
   const useremail =user.email;
   User.findOne({email:useremail}) 
   .then((data)=>{
    res.send({status: "ok", data:data});
   });
  } catch (error) {
    res.send({status: "error", data:error});
  }
});

{/*create API for Password Reset */}
app.post("/forgot-password",async(req,res)=>{
const {email} =req.body;
try {
  const oldUser =await User.findOne({email});
  if(!oldUser){
    return res.json({status: "User Not Exists!!"});
  }
  const secret = JWT_SECRET + oldUser.password;
  const token =jwt.sign({ email:oldUser.email, id:oldUser._id}, secret,{
    expiresIn:"5m",
  });
  const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rajanslions@gmail.com',
      pass: 'manwgmwzkziavhky',
    }
  });
  
  var mailOptions = {
    from: 'rajanslions@gmail.com',
    to: oldUser.email,
    subject: 'password reset',
    text: link,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }); 
  console.log(link);
} catch (error) {

}
});
{/*create API for get Password Reset detail */}
app.get("/reset-password/:id/:token",async (req, res)=>{
 const {id,token} = req.params;
 console.log(req.params);
 const oldUser = await User.findOne({_id:id});
 if(!oldUser){
  return res.json({status: "User Not Exists!!"});
}
const secret = JWT_SECRET + oldUser.password;
try {
  const verify= jwt.verify(token,secret);
  res.render("index",{email:verify.email,status:"Not verified"});
} catch (error) {
  res.send("Not Verified");
}
});

app.post("/reset-password/:id/:token",async (req, res)=>{
  const {id,token} = req.params;
  const {password,cpassword} = req.body;
  
  const oldUser = await User.findOne({_id:id});
  if(!oldUser){
   return res.json({status: "User Not Exists!!"});
 }
 if(password!=cpassword){
  return res.json({ status: "Not Match Confirm Password" });
 
}
 const secret = JWT_SECRET + oldUser.password;
 try {
   const verify= jwt.verify(token,secret);
   const encryptedPsaaword = await bcrypt.hash(password,10);
   await User.updateOne({
    _id:id,
   },
   {
    $set: {
      password:encryptedPsaaword,
    },
   });

   //res.json({status:"Password Updated"});
   res.render("index",{email: verify.email,status:"verified" });
 } catch (error) {
   console.log(error);
   res.json({status:"Something Went Wrong"}); 
 }
 });


 app.get("/getAllUser",async(req,res)=>{
  try {
    const allUser = await User.find({});
    res.send({ status : "ok", data:allUser})
  } catch (error) {
    console.log(error);

  }
 });
 /*delete user */
 app.post("/deleteUser", async(req,res) => {
 const {userid} = req.body;
 try {
  User.deleteOne({ _id: userid})
  .then(() => {
    console.log('Document deleted successfully');
  });
  res.send({status: "ok",data: "Deleted"});
 } catch (error) {
  console.log(error);
    
 }
 });

app.post("/member-post",async(req,res)=>{
  const {pTitle,base64,pDescription}=req.body;
  try {
   await Member.create({
      pTitle,
      image:base64,
      pDescription,
    });
    res.send({status:"ok"});
  } catch (error) {
    es.send({status:"error",data:error});
  }
});

app.get("/get-post",async(req,res)=>{
  try {
    await Member.find({}).then(data => {
      res.send({status:"ok",data:data})
    })
  } catch (error) {
    
  }
});
 
  app.listen(5000,()=>{
    console.log("server started");
  });



































{/* -----test connection-----
  app.post("/post",async(req,res)=>{
    console.log(req.body);
    const {data}=req.body;

    try {
      if(data1=="Adeepa"){
        res.send({status:"ok"})
        }else{
          res.send({status: "user not found"});
        }
      
    } catch (error) {
      res.send({ status: "Some think went wrong"});
    }

  }); 
*/}
{/* -------tset API--------
  require("./userDetails"); {/* import 

  const User =mongoose.model("UserInfo"); {/* access the UserInfo model 

  {/*create API for register 
  app.post("/register",async(req,res)=>{

   const {name,email,mobileNo}  = req.body;
    try {
      await User.create({
        uname:name,
        email,
        phoneNo: mobileNo,
      });
      res.send({state:"ok "});
    } catch (error) {
      res.send({state:"error "});
    }
  })
  */}