const { MongoClient } = require("mongodb")
let  state = {
    db:null
}
module.exports.connect=(done)=>{
const url = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1"
// const url = 'mongodb+srv://todo:todo@cluster0.kotutqe.mongodb.net/?retryWrites=true&w=majority'
dbname = "todo"
MongoClient.connect(url)
.then((data)=>state.db=data.db(dbname))
.then(()=>console.log("connected sucessfully"))
.catch((err)=>done(err))
}
module.exports.get=()=>{
    return state.db
}