//Import Packages  
  
var mongodb = require('mongodb');  
var ObjectID = mongodb.ObjectID;  
var crypto = require('crypto');  
var express = require('express');  
var bodyParser = require('body-parser');  
  
  
//Password Utils  
//Create Function to Random Salt  
  
var generateRandomString = function(length){  
    return crypto.randomBytes(Math.ceil(length/2))  
    .toString('hex') /* Convert to hexa formate */  
    .slice(0,length);  
};  
  
var sha512 = function(password, salt){  
    var hash = crypto.createHmac('sha512',salt);  
    hash.update(password);  
    var value = hash.digest('hex');  
    return{  
        salt:salt,  
        passwordHash:value  
    }  
};  
  
function saltHashPassword(userPassword){  
    var salt = generateRandomString(16);  
    var passwordData = sha512(userPassword,salt);  
    return passwordData;  
}  
  
function checkHashPassword(userPassword,salt){  
    var passwordData = sha512(userPassword,salt);  
    return passwordData;  
}  
  
//Create Express Service  
var app = express();  
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({extended:true}));  
  
//Create MongoDB Client  
var MongoClient = mongodb.MongoClient;  
  
//Connection URL  
var url = 'mongodb://localhost:27017' //27017 is default port  
var err = false;

//MongoClient.connect(url,{useNewUrlParser:true, useUnifiedTopology:true},function(err, client)  
//{  
    if(err)  
    {  
        console.log('Unable to connect to MongoDB server.Error',err);  
    }  
    else  
    {  
        //Start Web Server  
        app.listen(3000,()=> {console.log('Connected to MongoDb server, Webservice running on on port 3000');  
    });  
    }  
  
    //Register   
    app.post('/register',(request,response,next)=>  
    {  
        var post_data = request.body;  
  
        var plain_password = post_data.password;  
        var hash_data = saltHashPassword(plain_password);  
  
        var password = hash_data.passwordHash;  
        var salt = hash_data.salt;  
  
        var firstname = post_data.firstname;  
        var lastname = post_data.lastname;  
        var mobile = post_data.mobile;  
        var email = post_data.email;  
  
        var insertJson = {  
            'firstname':firstname,  
            'lastname' : lastname,  
            'email': email,  
            'mobile' : mobile,  
            'password': password,  
            'salt': salt  
        }; 
        console.log('User Registeration Successful..');  
        response.json('User Registeration Successful..');  
        /*
        var db = client.db('ahsannodejs');  
  
        //Check Already Exist Email  
        db.collection('user').find({'email':email}).count(function(err,number){  
            if(number != 0){  
                console.log('User Email already exist!');  
                response.json('User Email already exist!');  
            }else{  
                //Insert data  
                db.collection('user').insertOne(insertJson,function(err,res){  
                    console.log('User Registeration Successful..');  
                    response.json('User Registeration Successful..');  
                });  
            }  
        });  
        */
    });  
  
    //Login  
    app.post('/login',(request,response,next)=>  
    {  
        var post_data = request.body;  
  
        var email = post_data.email;  
        var userPassword = post_data.password;  
  
        var db = client.db('ahsannodejs');  
        /*
        //Check Already Exist Email  
        db.collection('user').find({'email':email}).count(function(err,number){  
            if(number == 0){  
                console.log('User Email not exist!');  
                response.json('User Email not exist!');  
            }else{  
                //Insert data  
                db.collection('user').findOne({'email':email},function(err,user)  
                {  
                    var salt = user.salt;  
                    var hashed_password = checkHashPassword(userPassword,salt).passwordHash; //Hash Password with Salt  
                    var encrypted_password = user.password; //Get Password from user  
                    if(hashed_password == encrypted_password)  
                    {  
                        console.log('User Login Successful..');  
                        response.json('User Login Successful..');  
                    }else  
                    {  
                        console.log('Login Failed Wrong Password..');  
                        response.json('Login Failed Wrong Password..');  
                    }  
                });  
            }  
        });  
        */
       console.log('Login Failed Wrong Password..');  
       response.json('Login Failed Wrong Password..');  
    });  
  
//}
//);  