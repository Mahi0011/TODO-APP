const session = require('express-session');
const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb');



var getcurrentdate =  ()=>{
        let year = new Date().getFullYear()
var month=('0'+(new Date().getMonth()+1)).slice(-2)
var day=('0'+(new Date().getDate())).slice(-2)
let date = year+'-'+month+'-'+day
return date
}

module.exports={
    insertUser : (user)=>{
        return new Promise(async (resolve,reject)=>{
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            let res = await db.get().collection('user').insertOne(user)
            resolve(res)
        })
},
checkEmail:(email)=>{
         return new Promise( async (resolve,reject)=>{
        let user =await db.get().collection('user').findOne({email})
        resolve(user)
         })
},
    doLogin:(log)=>{
        return new Promise( async (resolve,reject)=>{
            let response={}
            let user =await db.get().collection('user').findOne({email:log.email})
            if(user){
            await bcrypt.compare(log.password,user.password)
            .then((status)=>{
                if(status){
                    response.status=true
                    response.user=user
                }else{
                    response.status=false
                }
            })
        }else{
            response.status=false
        }resolve(response)
        })
    },


    addTodo:(data)=>{
        return new Promise(async (resolve,reject)=>{
            let res = await db.get().collection('todo').insertOne(data)
            resolve(res)
        })
    },


    viewTodo:(id,date)=>{
        return new Promise(async(resolve,reject)=>{
            if(!date){
                date = getcurrentdate()
            }

        let todo = await db.get().collection('todo').find({$and :[{id:id},{date:date}]}).toArray()
        resolve(todo)
    })
        


    },
    deleteTodo:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let objid = new ObjectId(id)
            let res = await db.get().collection('todo').deleteOne({_id:objid}) 
            resolve(res)
        })
    },


    
    editTodo:(todo,status)=>{
        return new Promise(async (resolve,reject)=>{
            // console.log(todo.id)
            let id = new ObjectId(todo.id)
            // console.log(id)
            let res = await db.get().collection('todo').updateOne({_id:id},{$set:{todo:todo.todos,date:todo.date,status:status}})
            // console.log(res)
            resolve(res)
        })
    }
}