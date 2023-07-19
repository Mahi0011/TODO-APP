const express = require('express');
const bodyParser = require('body-parser')
const db = require('./config/connection')
const mongo = require('./crud/mongo')
const session = require('express-session')


const app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
    secret:'secretkey',
    cookie:{maxAge:60*1000},
    resave: false,
    saveUninitialized: false
}))


app.set('view engine','hbs')
// app.set('view engine','ejs')


////////////////////DB CONNECT//////////////////////////

db.connect((err)=>{
    if(err)
    console.log("error",err)
})

///////////////////////LOGIN//////////////////////////////
var log = ""
var error = ""

app.get('/login', (req, res) => {
  res.render('login',{login:log,err:error});
 log = ""
 error = ""
})


app.post('/login',(req,res)=>{
    mongo.doLogin(req.body)
    .then((response)=>{
        if(response.status){
            req.session.loginDetails=response.user
            req.session.loginStatus=response.status
            res.redirect('/home')
        }
        else{
            error="login failed"
            log = "please enter valid details"
            res.redirect('/login')
        }
    })
})

/////////////////////SIGNUP////////////////////////

let signuperr;
let pass;
app.get('/signup', (req, res) => {
  res.render('signup', { err: signuperr, pass });
  pass = false;
  signuperr = '';
});

let passwordValidate = (password) => {
  if (password.length < 8)
    return false;
  else {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return regex.test(password);
  }
};

app.post('/signup', (req, res) => {
  let password = req.body.password;

  if (req.body.email === '') {
    signuperr = 'Please enter an email';
    res.redirect('/signup');
  } else if (req.body.password !== '') {
    let resp = passwordValidate(req.body.password);
    if (resp) {
      if (req.body.name === '') {
        signuperr = 'Please enter a name';
        res.redirect('/signup');
      } else {
        mongo.checkEmail(req.body.email)
          .then((result) => {
            if (result) {
              signuperr = 'Login failed, email already exists';
              res.redirect('/signup');
            } else {
              mongo.insertUser(req.body)
                .then((resp) => {
                  log = 'Please login to continue';
                  res.redirect('/login');
                });
            }
          });
      }
    } else {
      pass = true;
      res.redirect('/signup');
    }
  } else {
    signuperr = 'Please enter a password';
    res.redirect('/signup');
  }
});

log = "";







// app.get('/signup',(req,res)=>{
//     res.render('signup')
// })
// app.post('/signup', (req,res)=>{
//     mongo.insertUser(req.body)
//     .then((resp)=>{
//         log = "please login to continue"
//         res.redirect('/login')
//     })
//     // .catch((err)=>console.log(err))
    
// })
// log = ""

//////////////////HOME PAGE//////////////////////


app.get('/home',(req,res)=>{
    if(req.session.loginStatus)
    {
        let data = {
            id:req.session.loginDetails._id,
            date:'',
        }
        let name = req.session.loginDetails.name.toUpperCase
        mongo.viewTodo(data.id)
        .then((data)=>{
            let editstatus = req.session.editStatus
            if(data.length==0)
            {
                res.render('todohome',{todo:data,editstatus,name})
                req.session.editStatus=false
            }else{
                let date = data[0].date
                res.render('todohome',{todo:data,date:date,editstatus,name})
                req.session.editStatus=false
            }
        })
    }else{
        log = "please login to continue"
        res.redirect('/login')
    }
})

app.post('/homeload',(req,res)=>{
    if(req.session.loginStatus)
    {
        let data = {
            id:req.session.loginDetails._id,
            date:req.body.date
        }
        mongo.viewTodo(data.id,data.date)
        .then((data)=>{
            if(data.length==0)
            {
                let editstatus = req.session.editStatus
                res.render('todohome',{todo:data,editstatus})
            }else{
                let date = data[0].date
                let editstatus = req.session.editStatus
                res.render('todohome',{todo:data,date:date,editstatus})
            }


            
        })
    }else{
        log = "please login to continue"
        res.redirect('/login')
    }
})

/////////////////////////ADDTODO////////////////////

app.get('/addtodo',(req,res)=>{
    let data = {
        id:req.session.loginDetails._id,
        date:req.body.date
    }
    mongo.viewTodo(data.id,data.date)
    .then((data)=>{
        if(data.length==0)
        {
            let stat = req.session.todoAddStatus
        res.render('addtodo',{todo:data,status:stat})
        req.session.todoAddStatus=false
        }else{
            let date = data[0].date
        let stat = req.session.todoAddStatus
        res.render('addtodo',{todo:data,date:date,status:stat})
        req.session.todoAddStatus=false
        }
       
    })
    })

app.post('/addtodo',(req,res)=>{
    let user = {
        todo:req.body.todos,
        status:false,
        date:req.body.date,
        id:req.session.loginDetails._id
    }
    mongo.addTodo(user)
    .then((resp)=>{
        req.session.todoAddStatus=true
        res.redirect('/addTodo')
    })
})

//////////////////////////////EDIT TODO////////////////////////////////

app.get('/edit-todo',(req,res)=>{
    console.log('aaaaaaaaa',req.query)
    let id = req.query.id
    let date = req.query.date
    let todo = req.query.todo
    res.render('edit-todo',{id,date,todo})
})
app.post('/edit-todo',(req,res)=>{
    console.log('=========edit=============>',req.body)
    let status
    if(req.body.status.length==0)
    status = false
    else
    status=true
    console.log(status)
    mongo.editTodo(req.body,status)
    .then(()=>{
        req.session.editStatus=true
        res.redirect('/home')
    })
})

///////////////////////////DELETE TODO////////////////////////////////////

app.get('/delete-todo',(req,res)=>{
    mongo.deleteTodo(req.query.id)
    .then((resp)=>{
       res.redirect('/home')
    })
})




app.post('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login')
})


app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
