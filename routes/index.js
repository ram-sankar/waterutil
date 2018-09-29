const express = require('express');
const app = express();
const url_redirect = require('url');

var db_access = require('../models/user');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://ram:madhumitha123@ds125031.mlab.com:25031/waterutil";

/*mongo shell
mongo ds125031.mlab.com:25031/waterutil -u ram -p madhumitha123
*/

/*
- add
- login get-post
- register get-post
- daily-usage
- monthly-usage
- total-cons
- water-level
- bill
- logout
*/

app.get('/add', (req,res) =>{   
    //https://water-util.herokuapp.com/add?amount=33&dist=22
    //http://localhost:3000/add?amount=33&dist=22
    var amount = req.query.amount;
    var dist = req.query.dist;
    
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("waterutil");


      dbo.collection("ram_dailies").countDocuments({}, function(err, numOfDocs) {
          if(numOfDocs==24)
            {
              
                  //get the sum of amount => insert new row to monthly table
                  dbo.collection("ram_dailies").aggregate(
                    { $group: { _id : null, sum : { $sum: "$amount" } } },{$project:{_id:0,sum:1}}
                  ).toArray(function(err, result)
                  {
                        var total_amount = result[0].sum;
                        dbo.collection("ram_monthlies").countDocuments({}, function(err, numOfDocs) {
                    
                        if(numOfDocs==31)
                        {
                            var myquery = {};
                            dbo.collection("ram_monthlies").deleteMany(myquery, function(err, obj) {
                                if (err) throw err;
                                console.log(obj.result.n + " document(s) deleted");

                                var date = "31-8-2018";
                                var newmondata = new db_access.monthly({date:date, amount: total_amount});
                                db_access.monthly.create(newmondata, function(err, newmondata) {
                                    if(err) return next(err);                           
                                });
                            });
                         }
                        else
                        {
                            
                            var date = numOfDocs+"-9-2018";
                            var newdata = new db_access.monthly({date:date, amount: total_amount});
                            db_access.monthly.create(newdata, function(err, newdata) {
                                if(err) return next(err);                           
                            });
                        }
                  });

                  var myquery = {};
                  dbo.collection("ram_dailies").deleteMany(myquery, function(err, obj) {
                        if (err) throw err;
                        console.log(obj.result.n + " document(s) deleted");

                        var sno = 1;
                        var newdata = new db_access.daily({sno:sno, amount: amount});
                        db_access.daily.create(newdata, function(err, newdata) {
                            if(err) return next(err);                           
                        });
                  });  
              });
            }
           else
            {
                var sno = numOfDocs+1;
                var newdata = new db_access.daily({sno:sno, amount: amount});
                db_access.daily.create(newdata, function(err, newdata) {
                    if(err) return next(err);                           
                });
             }
     
      });
    
    
      dbo.collection("water_level").update({sno:1},{$set:{dist:dist}}), function(err, res) {
          if (err) throw err;          
      } 
  });
  
  res.send("sucess :)");
});



app.post('/app-waterlevel', (req,res) =>{   
  MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");                 
          dbo.collection("water_level").find({}).toArray(function(err, result) {
              if (err) throw err;
              res.render('app/water_level',{
                  level:result
              });

              db.close();
              });
  });    
});



app.post('/app-daily', (req,res) =>{   
  MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");                 
          dbo.collection("ram_dailies").find({}).toArray(function(err, result) {
              if (err) throw err;
              res.render('app/daily',{
                  amount:result
              });

              db.close();
              });
  });    
});



app.get('/app-monthly', (req,res) =>{   
  MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");                 
          dbo.collection("ram_monthlies").find({}).toArray(function(err, result) {
              if (err) throw err;
              res.render('app/monthly',{
                  amount:result
              });

              db.close();
              });
  });    
});



app.get('/', (req,res) =>{   
    var passedVariable = req.query.valid;
        req.sucess_msg = passedVariable;
    if(passedVariable){
        res.render('login',{
            title:"login",
            query:passedVariable
        });
    }
    else{
        req.sucess_msg = passedVariable;
        res.render('login',{
            title:"login",
            query:"nil"
        });
    }   
});

 
app.post('/',(req, res) =>{
    var username = req.body.username;
	var password = req.body.password;
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("waterutil");                 
        
        dbo.collection("customers").find({username: username, password: password}).toArray(function(err, result) {
        if (err) throw err;
          
            if(!result[0]) {
                res.render('login',{
                title:"login",
                query:"error"
                });
            }
            else{
                req.session.user = result[0];
                res.redirect(url_redirect.format({
                pathname:"/daily-usage",
                query: { title:"daily-usage" }
                }));
            } 
            
        db.close();
        });    
    });      
});    




app.get('/register',(req,res) =>{
    res.render('register');
});


app.post('/register',(req,res,next) =>{
   var username = req.body.username;
	var email = req.body.email;
	var phone = req.body.phone;
	var password = req.body.password;
	var password2 = req.body.c_password;
	req.checkBody('c_password', 'Passwords do not match').equals(req.body.password);  
    var amount = 0;
    var errors = req.validationErrors();
    
    if(errors)
    {        
        res.render('register', { value : errors});
    }
    else
    {       
                
        var newUser = new db_access.User({phone:phone, email: email, username:username,password:password,amount:amount});
                  db_access.User.create(newUser, function(err, newUser) {
                  if(err) return next(err);                           
                  });
        
        var string = "You are registered and can now login";
        res.redirect('/?query=' + string);
    }    
});



app.get('/daily-usage',(req,res) =>{ 
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");
          dbo.collection("ram_dailies").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('daily-usage',{
                title:"Daily usage",
                products:result
            });
            
            db.close();
          });
        }); 
});


app.get('/monthly-usage',(req,res) =>{ 
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");
          dbo.collection("ram_monthlies").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('monthly-usage',{
                title:"Monthly-usage",
                products:result
            });
            
            db.close();
          });
        }); 
});

app.get('/total-cons',(req,res) =>{ 
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");
          dbo.collection("customers").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('total-cons',{
                title:"Total Consumption",
                products:result
            });
            
            db.close();
          });
        }); 
});



app.get('/water-level',(req,res) =>{ 
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");
          dbo.collection("water_level").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('water-level',{
                title:"Water Level",
                products:result
            });
            
            db.close();
          });
        }); 
});



app.get('/bill',(req,res) =>{ 
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("waterutil");
          dbo.collection("ram_monthlies").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.render('bill',{
                title:"Bill",
                products:result
            });
            
            db.close();
          });
        }); 
});






app.get('/logout', function (req, res) {
  req.session.destroy();
  var string = "you have sucessfully logged out";
  res.redirect('/?valid=' + string);
});



module.exports = app;