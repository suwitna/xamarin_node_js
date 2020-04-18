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

//var algorithm = 'aes-256-ctr';
//var password = 'c8167bf6dfea7d8fbec4413420fe943a';
const algorithm = 'aes-192-cbc';
const password = 'c8167bf6dfea7d8fbec4413420fe943a';
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
// Use async `crypto.scrypt()` instead.
const key = crypto.scryptSync(password, 'salt', 24);
// Use `crypto.randomBytes()` to generate a random iv instead of the static iv
// shown here.
const iv = Buffer.alloc(16, 0); // Initialization vector.


function encrypt(text) {
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var encrypted = cipher.update(text,'utf8','hex');
    encrypted += cipher.final('hex');
    console.log("encrypt:", encrypted.toString());
    return encrypted.toString();
}


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
    app.listen(port,()=> {console.log('Connected to MongoDb server, Webservice running on on port '+ port);  
});  
}  
// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
    apiKey: "AIzaSyAmg4vqvEq_Yx89rMemZGOO9R1p4nL6mOw",
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
    console.log(email); 
    console.log(userPassword); 
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

app.post('/DenOfArtUserExist',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check User Exist");
    var post_data = request.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUsers');
    var existUser = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        console.log('vals:', vals);
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            var jsonObj = {data:[]};
            var obj = {};
            console.log('keys.length:', keys.length);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var user = vals[k].UserName;
                
                if(loginname == user){
                    existUser = true;
                    obj[k] = vals[k];
                    jsonObj.data.push(vals[k]);
                }
            }
        }
        if (!existUser){
            console.log(existUser);
            response.send(existUser);
        }else{
            console.log(existUser);
            response.send(existUser);
        }
    });
});

app.post('/DenOfArtRegister',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Register");
    var post_data = request.body;  
    var name = post_data.username;  
    var email = post_data.email;
    
    var plain_password = post_data.password;  
    var password = encrypt(plain_password);

    var mobile = post_data.phonenumber; 
    var isExist = false;

    var insertJson = {  
        'UserName':name,  
        'Email': email,  
        'Password': password,
        'PhoneNumber':mobile
    };
    //console.log(insertJson);
    // Get a reference to the database service
    var db = firebase.database();
    var rootRef = db.ref();
    
    /*
    var usersRef = rootRef.child("DenOfArtUsers");
    var userRef = usersRef.push();
    console.log('user key', userRef.key);
    usersRef.push(userRef.key).set(insertJson);
    console.log("User Registeration Successful..");
    console.log(insertJson);
    response.send(insertJson);
    */
    var dbRef = db.ref('DenOfArtUsers');
    dbRef.orderByChild('UserName').equalTo(name).once('value', (snapshot)=>{
        if(snapshot != null && snapshot != ''){
            if(snapshot.exists){
                var vals = snapshot.val();
                if(vals!=null && vals != ''){
                    var keys = Object.keys(vals);
                    for(var i=0; i<keys.length; i++){
                        var k = keys[i];
                        var username = vals[k].UserName;
                        
                        if(name == username){
                            isExist = true;
                            console.log("Username was exit!");
                        }
                    }
                }else{
                    isExist = false;
                    console.log("Username not found, can add");
                    var usersRef = rootRef.child("DenOfArtUsers");
                    var userRef = usersRef.push();
                    console.log('user key', userRef.key);
                    dbRef.push(userRef.key).set(insertJson);
                    console.log(insertJson);
                    response.send(insertJson);
                }
            }else{
                isExist = false;
                console.log("DenOfArtUsers not found(NOT EXIST)!");
                var usersRef = rootRef.child("DenOfArtUsers");
                var userRef = usersRef.push();
                console.log('user key', userRef.key);
                dbRef.push(userRef.key).set(insertJson);
                console.log(insertJson);
                response.send(insertJson);
            }
        }else{
            isExist = false;
            console.log("DenOfArtUsers not found(NULL)!");
            var usersRef = rootRef.child("DenOfArtUsers");
            var userRef = usersRef.push();
            console.log('user key', userRef.key);
            dbRef.push(userRef.key).set(insertJson);
            console.log(insertJson);
            response.send(insertJson);
        }

        if (isExist){
            console.log("FAIL");
            response.send("FAIL");
        }
    });
    
    
    /*
    var dbRef = db.ref('DenOfArtUsers');
    dbRef.once('value', (snapshot)=>{
        if(snapshot.exists()){
            console.log("DenOfArtUsers is exist");
            var userRef = dbRef.push();
            console.log('user key', userRef.key);
            dbRef.push(userRef.key).set(insertJson);
        }else{
            console.log("DenOfArtUsers is not exist!");
            var usersRef = rootRef.child("DenOfArtUsers");
            var userRef = usersRef.push();
            console.log('user key', userRef.key);
            dbRef.push(userRef.key).set(insertJson);
        }

        //dbRef.set(insertJson);
        if (data ==''){
            console.log('FAIL');
            response.send('FAIL');
        }else{
            console.log(insertJson);
            response.send(insertJson);
        }
    });
    */
});

app.post('/DenOfArtLogin',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Login");
    var post_data = request.body;

    if(Object.keys(post_data).length === 0){
        console.log('Not found username and password parameters');
        response.send(false);
        return;
    }
    
    var loginname = post_data.username;
    var loginpassword = post_data.password;

    if (loginname == undefined || loginpassword == undefined){
        console.log('Username and password can not empty!');
        response.send(false);
        return;
    }

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUsers');
    var existUser = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals !=null && vals !=''){
            var keys = Object.keys(vals);
            var jsonObj = {data:[]};
            var obj = {};
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var password = vals[k].Password;
                if(encrypt(loginpassword) == password){
                    existUser = true;
                    obj[k] = vals[k];
                    jsonObj.data.push(vals[k]);
                }
            }
        }
        if (!existUser){
            console.log(existUser);
            response.send(existUser);
        }else{
            console.log(existUser);
            response.send(existUser);
        }
    });
});

app.post('/DenOfArtChangePassword',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art Change Password");
    var post_data = request.body;
    if(Object.keys(post_data).length === 0){
        console.log('Not found username or password parameters');
        response.send(false);
        return;
    }

    var loginname = post_data.username;
    var loginpassword = post_data.password;
    var newpassword = post_data.newpassword;

    if (loginname == undefined || loginpassword == undefined || newpassword == undefined){
        console.log('Username, password or new password can not empty!');
        response.send(false);
        return;
    }

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUsers');
    var isDone = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var password = vals[k].Password;
                
                if(encrypt(loginpassword) == password){
                    var dataObj = vals[k]
                    console.log('user key', k);
                    console.log('loginpassword', encrypt(loginpassword));
                    console.log('newpassword', encrypt(newpassword));
                    var dataRef = dbRef.child(k);
                    dataRef.update({
                        "Password": encrypt(newpassword)
                    });
                    if(!isDone){
                        isDone = true;
                        break;
                    }
                }
            }
        }
        console.log(isDone);
        response.send(isDone);
    });
    
});

app.post('/DenOfArtCreatAppointment',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art Add Appointment");
    var post_data = request.body;  
    var username = post_data.username;
    var hn = post_data.hn;
    var customername = post_data.customername;
    var subject = post_data.subject;
    var appointmentdate = post_data.appointmentdate;//format DateTime# dd/MM/yyyy
    var appointmenttime = post_data.appointmenttime;//format DateTime# hh:mm
    var isapprove = post_data.isapprove;//Y or ''
    var istreat = post_data.istreat;//Y or ''
    var treatby = post_data.treatby;
    var treatdetail = post_data.treatdetail;
    var treatdate = post_data.treatdate;//format DateTime# dd/MM/yyyy
    var treattime = post_data.treattime;//format DateTime# hh:mm
    var iscancel = post_data.iscancel;//Y or ''
    var cancelreason = post_data.cancelreason;
    var ispostpone = post_data.ispostpone;//Y or ''
    var postponereason = post_data.postponereason;
    var createby = post_data.createby;
    var createdate = post_data.createdate;//format DateTime# dd/MM/yyyy hh:mm
    var updateby = post_data.updateby;
    var updatedate = post_data.updatedate;//format DateTime# dd/MM/yyyy hh:mm

    var isExist = false;

    var insertJson = {  
        'UserName':username == undefined?'':username ,
        'HN':hn == undefined?'':hn ,
        'CustomerName':customername == undefined?'':customername ,
        'Subject':subject == undefined?'':subject ,
        'AppointmentDate':appointmentdate == undefined?'':appointmentdate ,
        'AppointmentTime':appointmenttime == undefined?'':appointmenttime ,
        'IsApprove':isapprove == undefined?'':isapprove ,
        'IsTreat':istreat == undefined?'':istreat ,
        'TreatBy':treatby == undefined?'':treatby ,
        'TreatDetail':treatdetail == undefined?'':treatdetail ,
        'TreatDate':treatdate == undefined?'':treatdate ,
        'TreatTime':treattime == undefined?'':treattime ,
        'IsCancel':iscancel == undefined?'':iscancel ,
        'CancelReason':cancelreason == undefined?'':cancelreason ,
        'IsPostpone':ispostpone == undefined?'':ispostpone ,
        'PostponeReason':postponereason == undefined?'':postponereason ,
        'CreateBy':createby == undefined?'':createby ,
        'CreateDate':createdate == undefined?'':createdate ,
        'UpdateBy':updateby == undefined?'':updateby ,
        'UpdateDate':updatedate == undefined?'':updatedate 
    };
    console.log(insertJson);
    // Get a reference to the database service
    var db = firebase.database();
    var rootRef = db.ref();
    
    var dbRef = db.ref('DenOfArtAppointment');
    dbRef.orderByChild('UserName').equalTo(username).once('value', (snapshot)=>{
        if(snapshot != null && snapshot != ''){
            if(snapshot.exists){
                var vals = snapshot.val();
                if(vals!=null && vals != ''){
                    var keys = Object.keys(vals);
                    for(var i=0; i<keys.length; i++){
                        var k = keys[i];
                        var appHistDate = vals[k].AppointmentDate;
                        
                        if(appointmentdate == appHistDate){
                            isExist = true;
                            console.log("Appointment date was exit!");
                            response.send("FAIL");
                            return;
                        }
                    }
                }
            }
        }
        console.log("DenOfArtAppointment not found, can add..");
        var usersRef = rootRef.child("DenOfArtAppointment");
        var userRef = usersRef.push();
        console.log('user key', userRef.key);
        dbRef.push(userRef.key).set(insertJson);
        console.log(insertJson);
        response.send(insertJson);
        return;
    });
});

app.post('/DenOfArtGetAppointment',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art Get Appointment");
    var jsonObj = {Data:[]};
    var post_data = request.body;  
  
    var username = post_data.username;  
    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtAppointment');
    dbRef.orderByChild('UserName').equalTo(username).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals!= null && vals != ''){
            var keys = Object.keys(vals);
            var obj = {};

            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                console.log('keys[i]>>>'+ k );
                obj[k] = vals[k];
                jsonObj.Data.push(vals[k]);
            }
        }
        response.json(jsonObj);
    });
});

app.post('/webhook',(request,response,next)=> { 
    console.log("HTTP POST Request :: Den of Art Line App Webhook");
    var reply_token = request.body.events[0].replyToken
    var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    }
    var body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: 'Hello'
        },
        {
            type: 'text',
            text: 'How are you?'
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, response, body) => {
        console.log('status = ' + response.statusCode);
    });
    response.sendStatus(200);
});