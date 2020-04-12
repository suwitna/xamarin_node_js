//Import Packages  
  
var mongodb = require('mongodb');  
var ObjectID = mongodb.ObjectID;  
var crypto = require('crypto');  
var express = require('express');  
var bodyParser = require('body-parser');
var firebase = require('firebase');
/*
var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://maplocation-4b2a1.firebaseio.com"
});
*/

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
var port = process.env.PORT || 3000;
//MongoClient.connect(url,{useNewUrlParser:true, useUnifiedTopology:true},function(err, client)  
//{  
if(err)  
{  
    console.log('Unable to connect to MongoDB server.Error',err);  
}  
else  
{  
    //Start Web Server  
    app.listen(port,()=> {console.log('Connected to MongoDb server, Webservice running on on port 3000');  
});  
}  
// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
    apiKey: "AIzaSyB5qUVavHltwYOsmxgShp-wQv2PUge5Ny4",
    authDomain: "maplocation-4b2a1.firebaseapp.com",
    databaseURL: "https://maplocation-4b2a1.firebaseio.com",
    //projectId: "maplocation-4b2a1",
    storageBucket: "maplocation-4b2a1.appspot.com"
    //messagingSenderId: "141744972127"
};

firebase.initializeApp(config);

//Register   
app.post('/register',(request,response,next)=>  
{  
    var post_data = request.body;  

    var plain_password = post_data.password;  
    var hash_data = saltHashPassword(plain_password);  

    var password = hash_data.passwordHash;  

    var name = post_data.name;  
    var email = post_data.email;  

    var insertJson = {  
        'name':name,  
        'email': email,  
        'password': password
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
    
    /*
    var db = client.db('ahsannodejs');  
    
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
    console.log('User Login Successful..');  
    response.json('User Login Successful..');  
});  

//}
//);  


app.post('/firebase',(request,response,next)=> { 
    console.log("HTTP Get Request :: Firebase");
    var post_data = request.body;  
  
    var PostalCode = post_data.PostalCode;  
    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('MapTracking');
    dbRef.orderByChild('LoginName').equalTo('suwit').on('value', (snapshot)=>{
        var vals = snapshot.val();
        var keys = Object.keys(vals);
        var jsonObj = {data:[]};
        var obj = {};
        for(var i=0; i<keys.length; i++){
            var k = keys[i];
            var createDate = vals[k].CreateDate;
            
            if(createDate != null && createDate != ''){
                var res = createDate.match('2020-04-01');
                if (res != null && res != ''){
                    console.log('res>>>'+ res);
                    obj[k] = vals[k];
                    jsonObj.data.push(vals[k]);
                }
                
            }
        }
        response.json(jsonObj);
        //console.log(snapshot.val());
        //response.json(snapshot.val());
    });
    /*
    var ref = firebase.database().ref("MapTracking");
    
    //Attach an asynchronous callback to read the data
    ref.on("value",
        function(snapshot) {
            console.log(snapshot.val());
            response.json(snapshot.val());
            ref.off("value");
        }, 
        function (errorObject) {
            console.log("The read failed: " + errorObject.code);
            response.send("The read failed: " + errorObject.code);
        });
       */ 
});

app.post('/DenOfArtRegister',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Register");
    var post_data = request.body;  
    var name = post_data.UserName;  
    var email = post_data.Email;
    var password = post_data.Password;  
    var mobile = post_data.PhoneNumber;   

    var insertJson = {  
        'UserName':name,  
        'Email': email,  
        'Password': password,
        'PhoneNumber':mobile
    };

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUsers');
    dbRef.set(insertJson);
    console.log('User Registeration Successful..');  
    response.json('User Registeration Successful..');  
});