//Import Packages  
var mongodb = require('mongodb');  
var ObjectID = mongodb.ObjectID;  
var crypto = require('crypto');  
var express = require('express');  
var bodyParser = require('body-parser');
var firebase = require('firebase');
const request = require('request');
var dateFormat = require('dateformat');

//Password Utils  
//Create Function to Random Salt  
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
    app.listen(port,()=> {console.log('Connected to NodeJS server, Webservice running on on port '+ port);  
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
app.post('/register',(req,res,next)=>  
{  
    var post_data = req.body;  

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
    res.json('User Registeration Successful..');  
    /*
    var db = client.db('ahsannodejs');  

    //Check Already Exist Email  
    db.collection('user').find({'email':email}).count(function(err,number){  
        if(number != 0){  
            console.log('User Email already exist!');  
            res.json('User Email already exist!');  
        }else{  
            //Insert data  
            db.collection('user').insertOne(insertJson,function(err,res){  
                console.log('User Registeration Successful..');  
                res.json('User Registeration Successful..');  
            });  
        }  
    });  
    */
});  
  
//Login  
app.post('/login',(req,res,next)=>  
{  
    var post_data = req.body;  

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
            res.json('User Email not exist!');  
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
                    res.json('User Login Successful..');  
                }else  
                {  
                    console.log('Login Failed Wrong Password..');  
                    res.json('Login Failed Wrong Password..');  
                }  
            });  
        }  
    });  
    */
    console.log('User Login Successful..');  
    res.json('User Login Successful..');  
});  

//}
//);  


app.post('/firebase',(req,res,next)=> { 
    console.log("HTTP Get Request :: Firebase");
    var post_data = req.body;  
  
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
        res.json(jsonObj);
        //console.log(snapshot.val());
        //res.json(snapshot.val());
    });
    /*
    var ref = firebase.database().ref("MapTracking");
    
    //Attach an asynchronous callback to read the data
    ref.on("value",
        function(snapshot) {
            console.log(snapshot.val());
            res.json(snapshot.val());
            ref.off("value");
        }, 
        function (errorObject) {
            console.log("The read failed: " + errorObject.code);
            res.send("The read failed: " + errorObject.code);
        });
       */ 
});

app.post('/DenOfArtUserExist',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check User Exist");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
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
            res.send(existUser);
        }else{
            console.log(existUser);
            res.send(existUser);
        }
    });
});

app.post('/DenOfArtGetUserData',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Get User Data");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
    var existUser = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        var obj = {};
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            
            console.log('keys.length:', keys.length);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var user = vals[k].UserName;
                
                if(loginname == user){
                    existUser = true;
                    obj[k] = vals[k];
                    console.log({
                        'Email': vals[k].Email,
                        'Password': vals[k].Password,
                        'PhoneNumber': vals[k].PhoneNumber,
                        'UserName': vals[k].UserName
                    });
                    res.json({
                        'Email': vals[k].Email,
                        'Password': vals[k].Password,
                        'PhoneNumber': vals[k].PhoneNumber,
                        'UserName': vals[k].UserName
                    });
                    return;
                }
            }
        }

        console.log(obj);
        res.json(obj);
    });
});

app.post('/DenOfArtRegister',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Register");
    var post_data = req.body;  
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
    var dbRef = db.ref('DenOfArtUser');

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
                            console.log('Username was exit!');
                            res.send('FAIL');
                            return;
                        }
                    }
                }
            }
        }

        isExist = false;
        console.log('DenOfArtUser not found, user can register');
        var usersRef = rootRef.child("DenOfArtUser");
        var userRef = usersRef.push();
        console.log('user key', userRef.key);
        dbRef.push(userRef.key).set(insertJson);
        console.log(insertJson);
        res.send(insertJson);
        return;
    });
});

app.post('/DenOfArtLogin',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Login");
    var post_data = req.body;

    if(Object.keys(post_data).length === 0){
        console.log('Not found username and password parameters');
        res.send(false);
        return;
    }
    
    var loginname = post_data.username;
    var loginpassword = post_data.password;

    if (loginname == undefined || loginpassword == undefined){
        console.log('Username and password can not empty!');
        res.send(false);
        return;
    }

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
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
            res.send(existUser);
        }else{
            console.log(existUser);
            res.send(existUser);
        }
    });
});

app.post('/DenOfArtChangePassword',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Change Password");
    var post_data = req.body;
    if(Object.keys(post_data).length === 0){
        console.log('Not found username or password parameters');
        res.send(false);
        return;
    }

    var loginname = post_data.username;
    var loginpassword = post_data.password;
    var newpassword = post_data.newpassword;

    if (loginname == undefined || loginpassword == undefined || newpassword == undefined){
        console.log('Username, password or new password can not empty!');
        res.send(false);
        return;
    }

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
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
        res.send(isDone);
    });
    
});

app.post('/DenOfArtGetProfile',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Get Profile");
    var jsonObj = {Data:[]};
    var post_data = req.body;  
  
    var username = post_data.username;  
    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtProfile');
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
        res.json(jsonObj);
    });
});

app.post('/DenOfArtAddProfile',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Add Profile");
    var post_data = req.body;  
    //Get parameters
    var ProfileId = post_data.profileid;
    var UserName = post_data.username;
    var FirstName = post_data.firstname;
    var LastName = post_data.lastname;
    var Gender = post_data.gender;
    var DateOfBirth = post_data.dateofbirth;
    var Address1 = post_data.address1;
    var Address2 = post_data.address2;
    var Address3 = post_data.address3;
    var Email = post_data.email;
    var PhoneNumber = post_data.phonenumber;
    var LineID = post_data.lineid;
    var CreateDate = post_data.createdate;
    var UpdateDate = post_data.updatedate;
    var day=dateFormat(new Date(), "dd/mm/yyyy hh:MM TT");

    var insertJson = {  
        'ProfileId':ProfileId == undefined?'':ProfileId,
        'UserName':UserName == undefined?'':UserName,
        'FirstName':FirstName == undefined?'':FirstName,
        'LastName':LastName == undefined?'':LastName,
        'Gender':Gender == undefined?'':Gender,
        'DateOfBirth':DateOfBirth == undefined?'':DateOfBirth,
        'Address1':Address1 == undefined?'':Address1,
        'Address2':Address2 == undefined?'':Address2,
        'Address3':Address3 == undefined?'':Address3,
        'Email':Email == undefined?'':Email,
        'PhoneNumber':PhoneNumber == undefined?'':PhoneNumber,
        'LineID':LineID == undefined?'':LineID,
        'CreateDate':day,
    };
    console.log(insertJson);
    // Get a reference to the database service
    var db = firebase.database();
    var rootRef = db.ref();
    
    var dbRef = db.ref('DenOfArtProfile');
    dbRef.orderByChild('UserName').equalTo(UserName).once('value', (snapshot)=>{
        if(snapshot != null && snapshot != ''){
            if(snapshot.exists){
                var vals = snapshot.val();
                if(vals!=null && vals != ''){
                    var keys = Object.keys(vals);
                    for(var i=0; i<keys.length; i++){
                        var k = keys[i];
                        var newUserName = vals[k].UserName;
                        
                        if(newUserName == UserName){
                            console.log("Profile data was exit!");
                            res.send("FAIL");
                            return;
                        }
                    }
                }
            }
        }
        console.log("Profile not found, you can add more information.");
        var usersRef = rootRef.child("DenOfArtProfile");
        var userRef = usersRef.push();
        console.log('user key', userRef.key);
        dbRef.push(userRef.key).set(insertJson);
        console.log(insertJson);
        res.send(insertJson);
        return;
    });
});

app.post('/DenOfArtUpdateProfile',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Update Profile");
    var post_data = req.body;
    if(Object.keys(post_data).length === 0){
        console.log('No data found');
        res.send(false);
        return;
    }

    //Get parameters
    var ProfileId = post_data.profileid;
    var UserName = post_data.username;
    var FirstName = post_data.firstname;
    var LastName = post_data.lastname;
    var Gender = post_data.gender;
    //var Age = post_data.age;
    var DateOfBirth = post_data.dateofbirth;
    var Address1 = post_data.address1;
    var Address2 = post_data.address2;
    var Address3 = post_data.address3;
    var Email = post_data.email;
    var PhoneNumber = post_data.phonenumber;
    //var Content = post_data.content;
    //var FileName = post_data.filename;
    var LineID = post_data.lineid;
    //var CreateDate = post_data.createdate;
    var UpdateDate = post_data.updatedate;
    /*
    var insertJson = {  
        'ProfileId':ProfileId == undefined?'':ProfileId,
        'UserName':UserName == undefined?'':UserName,
        'FirstName':FirstName == undefined?'':FirstName,
        'LastName':LastName == undefined?'':LastName,
        'Gender':Gender == undefined?'':Gender,
        'Age':Age == undefined?'':Age,
        'DateOfBirth':DateOfBirth == undefined?'':DateOfBirth,
        'Address1':Address1 == undefined?'':Address1,
        'Address2':Address2 == undefined?'':Address2,
        'Address3':Address3 == undefined?'':Address3,
        'Email':Email == undefined?'':Email,
        'PhoneNumber':PhoneNumber == undefined?'':PhoneNumber,
        'Content':Content == undefined?'':Content,
        'FileName':FileName == undefined?'':FileName,
        'LineID':LineID == undefined?'':LineID,
        'CreateDate':CreateDate == undefined?'':CreateDate,
        'UpdateDate':UpdateDate == undefined?'':UpdateDate
    };
    */
    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtProfile');
    var day=dateFormat(new Date(), "dd/mm/yyyy hh:MM TT");
    console.log('date-time:', day);
    dbRef.orderByChild('UserName').equalTo(UserName).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var updateUserName = vals[k].UserName;
                console.log('User Name:', UserName, ', ',updateUserName);
                if(UserName == updateUserName){
                    var dataObj = vals[k]
                    console.log('user key', k);
                    var dataRef = dbRef.child(k);
                    dataRef.update({
                        'ProfileId':ProfileId == undefined?vals[k].ProfileId:ProfileId,
                        'FirstName':FirstName == undefined?vals[k].FirstName:FirstName,
                        'LastName':LastName == undefined?vals[k].LastName:LastName,
                        'Gender':Gender == undefined?vals[k].Gender:Gender,
                        'DateOfBirth':DateOfBirth == undefined?vals[k].DateOfBirth:DateOfBirth,
                        'Address1':Address1 == undefined?vals[k].Address1:Address1,
                        'Address2':Address2 == undefined?vals[k].Address2:Address2,
                        'Address3':Address3 == undefined?vals[k].Address3:Address3,
                        'Email':Email == undefined?vals[k].Email:Email,
                        'LineID':LineID == undefined?vals[k].LineID:LineID,
                        'PhoneNumber':PhoneNumber == undefined?vals[k].PhoneNumber:PhoneNumber,
                        'UpdateDate':day,
                    });
                    console.log('true');
                    res.send('true');
                    return;
                }
            }
        }
        console.log('false');
        res.send('false');
        return;
    });
    
});

app.post('/DenOfArtCreatAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Add Appointment");
    var post_data = req.body;  
    var username = post_data.username;
    var hn = post_data.hn;
    var customername = post_data.customername;
    var subject = post_data.subject;
    var appointmentdate = post_data.appointmentdate;//format DateTime# dd/MM/yyyy
    var appointmenttime = post_data.appointmenttime;//format DateTime# hh:mm
    var status = post_data.status;
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
    var day=dateFormat(new Date(), "dd/mm/yyyy hh:MM TT");

    var insertJson = {  
        'UserName':username == undefined?'':username ,
        'HN':hn == undefined?'':hn ,
        'CustomerName':customername == undefined?'':customername ,
        'Subject':subject == undefined?'':subject ,
        'AppointmentDate':appointmentdate == undefined?'':appointmentdate ,
        'AppointmentTime':appointmenttime == undefined?'':appointmenttime ,
        'Status':status == undefined?'':status ,
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
        'UpdateDate':day,
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
                            console.log("Appointment data was exit!");
                            res.send("FAIL");
                            return;
                        }
                    }
                }
            }
        }
        console.log("Appointment not found, you can add more information.");
        var usersRef = rootRef.child("DenOfArtAppointment");
        var userRef = usersRef.push();
        console.log('user key', userRef.key);
        dbRef.push(userRef.key).set(insertJson);
        console.log(insertJson);
        res.send(insertJson);
        return;
    });
});

app.post('/DenOfArtGetAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Get Appointment");
    var jsonObj = {Data:[]};
    var post_data = req.body;  
  
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
        res.json(jsonObj);
    });
});

app.post('/webhook',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Line App Webhook");
    var reply_token = req.body.events[0].replyToken;
    var user_type = req.body.events[0].source.type;
    var user_id = req.body.events[0].source.userId
    var msg = req.body.events[0].message.text;

    console.log(`Message token : ${ reply_token }`);
    console.log(`Message user Type : ${ user_type }`);
    console.log(`Message user ID : ${ user_id }`);
    console.log(`Message : ${ msg }`);
    if (msg != null && msg != undefined){
        console.log('Message :', msg.toString('utf8'));
    }
    reply(reply_token);
    res.sendStatus(200);
    //var replyToken = req.body.events[0].replyToken;
    //var msg = req.body.events[0].message.text;
    
    //console.log(`Message token : ${ replyToken }`);
    //console.log(`Message from chat : ${ msg }`);

    /*
    res.json({
        status: 200,
        message: `Webhook is working!`
    });
    */
    /*
    //var reply_token = req.body.events[0].replyToken
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    }
    var body = {
        status: 200,
        messages: 'Test',
        USER: 'suvit2599'
        
    };

    res.json({
        url: 'https://notify-api.line.me/api/status',
        headers: headers,
        message: body
    });
    */
    //Custom Header pass
    /*

    var headersOpt = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    };

    var body = {
        status: 200,
        messages: 'Test',
        USER: 'suvit2599'
        
    };

    var options = {
        url: 'https://notify-api.line.me/api/status',
        method: 'POST',
        headers: headersOpt,
        body : body
      }

    var req = https.req(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
      });
      
      req.on('error', error => {
        console.error(error)
      });


    res.sendStatus(200);
    */
});

function reply(reply_token) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    }

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: 'สวัสดีคะ'
        },
        {
            type: 'text',
            text: 'ยินดีต้อนรับเข้าสู่ระบบสมาชิก Den Of Art'
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

app.post('/LINEPushMessage',(req,res,next)=> { 
    console.log("HTTP POST Request :: LINEPushMessage");
    var reply_token = 'Not need to use token';
    var post_data = req.body;  
    var push_message = post_data.message;

    console.log(`Message token : ${ reply_token }`);
    pushMessage(reply_token, push_message);
    res.sendStatus(200);
});

function pushMessage(reply_token, push_message) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    }

    let body = JSON.stringify({
        //to: 'U95d0e01a7247c7e3f167b118cf424f6e', //Suwit
        //to:'U3408f00a20e28ab3486a8563c2027537', //Arm
        to:'Uda1584fd66bf59c42f4dfddbd11ecb99',//Sai
        messages: [{
            type: 'text',
            text: push_message
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

app.post('/LINEBroadcastMessage',(req,res,next)=> { 
    console.log("HTTP POST Request :: LINEBroadcastMessage");
    var reply_token = 'Not need to use token';
    console.log(`Message token : ${ reply_token }`);
    broadcastMessage();
    res.sendStatus(200);
});

function broadcastMessage() {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {6P5TzfMs7eu/RHrY1vQzjU/Zn4+Z0BgN6vM7uNZN/ED/TWV0rReqn4GAzkEV64LNFvS3gXiEVSldCQZUZ76nQArk8mqqsLZYt2tDItvjaACADcNPEGm8jtZ5ZzbQUG2SLKirsfVJzpkj3Ak5B+P/ygdB04t89/1O/w1cDnyilFU=}'
    }

    let body = JSON.stringify({
        messages: [{
            type: 'text',
            text: 'ทดสอบการปล่อยข้อมูลไปยังสมาชิกทุกท่าน'
        }]
    })
    request.post({
        method: 'POST',
        url: 'https://api.line.me/v2/bot/message/broadcast',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

app.get('/wakeup',(req,res,next)=>  
{  
    console.log('Hey, Heroku wakeup!!!');  
    res.sendStatus(200);
});  