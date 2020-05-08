//Import Packages  
var mongodb = require('mongodb');  
var ObjectID = mongodb.ObjectID;  
var crypto = require('crypto');  
var express = require('express');  
var bodyParser = require('body-parser');
var firebase = require('firebase');
const request = require('request');
var dateFormat = require('dateformat');
var mysql = require('mysql');

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
//Arm
var config = {
    apiKey: "AIzaSyAPMyOHvRT0kK_PEVZtoZRZl_pcjcRLc_M",
    authDomain: "denofart-e2105.firebaseapp.com",
    databaseURL: "https://denofart-e2105.firebaseio.com",
    //projectId: "denofart-e2105",
    storageBucket: "denofart-e2105.appspot.com"
    //messagingSenderId: "782956333810"
};

firebase.initializeApp(config);

//MySql connection initial
var mysql_con = mysql.createConnection({
    host: "103.22.183.220",
    user: "smomscic_doaCode",
    password: "jG4rti7iw",
    database: "smomscic_doaCode"
});
//End

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
    }); 
});

app.post('/DenOfArtUserExist',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check User Exist");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
    var existUser = false;

    if (loginname == undefined || loginname == null || loginname == '' || loginname.trim().toUpperCase() == 'ALL'){
        console.log('Username is not blank or ALL');
        res.send(existUser);
        return;
    }

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

app.post('/DenOfArtFindUser',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check Find User");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
    var existUser = false;
    console.log('Login Name:', loginname);

    if (loginname == undefined || loginname == null || loginname == ''){
        console.log('Not found any payload information');
        res.send('Not found any payload information');
        return;
    }

    if (loginname.trim().toUpperCase() != 'ALL' ){
        dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
            var vals = snapshot.val();
            if(vals != null && vals != ''){
                var keys = Object.keys(vals);
                var obj = {};
                console.log('keys.length:', keys.length);
                for(var i=0; i<keys.length; i++){
                    var k = keys[i];
                    var user = vals[k].UserName;
                    
                    if(loginname == user){
                        obj[k] = vals[k];
                        res.json(vals[k]);
                        return;
                    }
                }
            }

            console.log('User not found');
            res.send('User not found');
            return;
        });
    }
    else{
        dbRef.orderByChild('UserName').once('value', (snapshot)=>{
            var vals = snapshot.val();
            if(vals != null && vals != ''){
                console.log(vals);
                res.json(vals);
                return;
            }

            console.log('No data avaiable in user table');
            res.send('No data avaiable in user table');
            return;
        });
    }
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
        //MySql
        RegisterMySql(name, password, email, mobile);
        //End
        console.log(insertJson);
        res.send(insertJson);
        return;
    });
});

app.post('/DenOfArtLogin',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art User Login");
    var post_data = req.body;
    var obj = {};

    if(Object.keys(post_data).length === 0){
        console.log('Not found username and password parameters');
        res.json(obj);
        return;
    }
    
    var loginname = post_data.username;
    var loginpassword = post_data.password;

    if (loginname == undefined || loginpassword == undefined){
        console.log('Username and password can not empty!');
        res.json(obj);
        return;
    }

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtUser');
    var existUser = false;
    /*
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
    
   */
   dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            
            console.log('keys.length:', keys.length);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var password = vals[k].Password;
                
                if(encrypt(loginpassword) == password){
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

app.post('/DenOfArtFindProfile',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check Find Profile");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtProfile');
    var existUser = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        console.log('vals:', vals);
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            var obj = {};
            var i = 0;
            console.log('keys.length:', keys.length);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var user = vals[k].UserName;
                
                if(loginname == user){
                    obj[k] = vals[k];
                    res.json(vals[k]);
                    return;
                }
            }
        }

        console.log('User profile not found');
        res.send('User profile not found');
        return;
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
    var DateOfBirth = post_data.dateofbirth;
    var Address1 = post_data.address1;
    var Address2 = post_data.address2;
    var Address3 = post_data.address3;
    var Email = post_data.email;
    var PhoneNumber = post_data.phonenumber;
    var LineID = post_data.lineid;

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
                    console.log({
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
                    UpdateProfileMySql(
                        UserName, 
                        FirstName == undefined?vals[k].FirstName:FirstName, 
                        LastName == undefined?vals[k].LastName:LastName, 
                        Address1 == undefined?vals[k].Address1:Address1, 
                        Address2 == undefined?vals[k].Address2:Address2, 
                        Address3 == undefined?vals[k].Address3:Address3
                        );
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

app.post('/DenOfArtFindAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check Find Appointment");
    var post_data = req.body;  
  
    var loginname = post_data.username;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtAppointment');
    var existUser = false;

    dbRef.orderByChild('UserName').equalTo(loginname).once('value', (snapshot)=>{
        var vals = snapshot.val();
        console.log('vals:', vals);
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            var obj = {};
            var i = 0;
            console.log('keys.length:', keys.length);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var user = vals[k].UserName;
                
                if(loginname == user){
                    obj[k] = vals[k];
                    existUser = true;
                }
            }
            if(existUser)
            {
                res.json(obj);
                return;
            }
        }

        console.log('Appointment not found');
        res.send('Appointment not found');
        return;
    });
});

app.post('/DenOfArtAddAppointment',(req,res,next)=> { 
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
    var postponedate = post_data.postponedate;//format DateTime# dd/MM/yyyy
    var postponetime = post_data.postponetime;//format DateTime# hh:mm
    var postponereason = post_data.postponereason;
    var createby = post_data.createby;
    var updateby = post_data.updateby;

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
        'PostponeDate':postponedate == undefined?'':postponedate ,
        'PostponeTime':postponetime == undefined?'':postponetime ,
        'PostponeReason':postponereason == undefined?'':postponereason ,
        'CreateBy':createby == undefined?'':createby ,
        'CreateDate':day ,
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

app.post('/DenOfArtGetAllAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Get All Appointment of Customer");
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

app.post('/DenOfArtExistAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Check Appointment by date/time");
    var post_data = req.body;
    if(Object.keys(post_data).length === 0){
        console.log('No data found');
        res.send(false);
        return;
    }

    //Get parameters
    var post_data = req.body;  
    var UserName = post_data.username;
    var AppointmentDate = post_data.appointmentdate;//format DateTime# dd/MM/yyyy
    var AppointmentTime = post_data.appointmenttime;//format DateTime# hh:mm

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtAppointment');
    var day = dateFormat(new Date(), "dd/mm/yyyy hh:MM TT");

    console.log('date-time:', day);
    dbRef.orderByChild('UserName').equalTo(UserName).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var updateUserName = vals[k].UserName;
                var updateAppointmentDate = vals[k].AppointmentDate;
                var updateAppointmentTime = vals[k].AppointmentTime;

                console.log('Appointment Infomation');
                console.log('User Name:', UserName);
                console.log('Appointment Date:', AppointmentDate);
                console.log('Appointment Time:', AppointmentTime);

                if((UserName == updateUserName) && (AppointmentDate == updateAppointmentDate)  && (AppointmentTime == updateAppointmentTime)){
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

app.post('/DenOfArtUpdateAppointment',(req,res,next)=> { 
    console.log("HTTP POST Request :: Den of Art Update Appointment");
    var post_data = req.body;
    if(Object.keys(post_data).length === 0){
        console.log('No data found');
        res.send(false);
        return;
    }

    //Get parameters
    var post_data = req.body;  
    var UserName = post_data.username;
    var HN = post_data.hn;
    var CustomerName = post_data.customername;
    var Subject = post_data.subject;
    var AppointmentDate = post_data.appointmentdate;//format DateTime# dd/MM/yyyy
    var AppointmentTime = post_data.appointmenttime;//format DateTime# hh:mm
    var Status = post_data.status;
    var IsApprove = post_data.isapprove;//Y or ''
    var IsTreat = post_data.istreat;//Y or ''
    var TreatBy = post_data.treatby;
    var TreatDetail = post_data.treatdetail;
    var TreatDate = post_data.treatdate;//format DateTime# dd/MM/yyyy
    var TreatTime = post_data.treattime;//format DateTime# hh:mm
    var IsCancel = post_data.iscancel;//Y or ''
    var CancelReason = post_data.cancelreason;
    var IsPostpone = post_data.ispostpone;//Y or ''
    var PostponeDate = post_data.postponedate;//format DateTime# dd/MM/yyyy
    var PostponeTime = post_data.postponetime;//format DateTime# hh:mm
    var PostponeReason = post_data.postponereason;
    var UpdateBy = post_data.updateby;

    // Get a reference to the database service
    var db = firebase.database();
    var dbRef = db.ref('DenOfArtAppointment');
    var day = dateFormat(new Date(), "dd/mm/yyyy hh:MM TT");

    console.log('date-time:', day);
    dbRef.orderByChild('UserName').equalTo(UserName).once('value', (snapshot)=>{
        var vals = snapshot.val();
        if(vals != null && vals != ''){
            var keys = Object.keys(vals);
            for(var i=0; i<keys.length; i++){
                var k = keys[i];
                var updateUserName = vals[k].UserName;
                var updateAppointmentDate = vals[k].AppointmentDate;
                var updateAppointmentTime = vals[k].AppointmentTime;

                console.log('Appointment Infomation');
                console.log('User Name:', UserName);
                console.log('Appointment Date:', AppointmentDate);
                console.log('Appointment Time:', AppointmentTime);

                console.log('User Name:', UserName, ', ',updateUserName);
                if((UserName == updateUserName) && (AppointmentDate == updateAppointmentDate)  && (AppointmentTime == updateAppointmentTime)){
                    console.log('user key', k);
                    var dataRef = dbRef.child(k);
                    dataRef.update({
                        'HN':HN == undefined?vals[k].HN:HN ,
                        'CustomerName':CustomerName == undefined?vals[k].CustomerName:CustomerName ,
                        'Subject':Subject == undefined?vals[k].Subject:Subject ,
                        'AppointmentDate':AppointmentDate == undefined?vals[k].AppointmentDate:AppointmentDate ,
                        'AppointmentTime':AppointmentTime == undefined?vals[k].AppointmentTime:AppointmentTime ,
                        'Status':Status == undefined?vals[k].Status:Status ,
                        'IsApprove':IsApprove == undefined?vals[k].IsApprove:IsApprove ,
                        'IsTreat':IsTreat == undefined?vals[k].IsTreat:IsTreat ,
                        'TreatBy':TreatBy == undefined?vals[k].TreatBy:TreatBy ,
                        'TreatDetail':TreatDetail == undefined?vals[k].TreatDetail:TreatDetail ,
                        'TreatDate':TreatDate == undefined?vals[k].TreatDate:TreatDate ,
                        'TreatTime':TreatTime == undefined?vals[k].TreatTime:TreatTime ,
                        'IsCancel':IsCancel == undefined?vals[k].IsCancel:IsCancel ,
                        'CancelReason':CancelReason == undefined?vals[k].CancelReason:CancelReason ,
                        'IsPostpone':IsPostpone == undefined?vals[k].IsPostpone:IsPostpone ,
                        'PostponeDate':PostponeDate == undefined?vals[k].PostponeDate:PostponeDate ,
                        'PostponeTime':PostponeTime == undefined?vals[k].PostponeTime:PostponeTime ,
                        'PostponeReason':PostponeReason == undefined?vals[k].PostponeReason:PostponeReason ,
                        'UpdateBy':UpdateBy == undefined?vals[k].UpdateBy:UpdateBy ,
                        'UpdateDate':day,
                    });
                    console.log({
                        'HN':HN == undefined?vals[k].HN:HN ,
                        'CustomerName':CustomerName == undefined?vals[k].CustomerName:CustomerName ,
                        'Subject':Subject == undefined?vals[k].Subject:Subject ,
                        'AppointmentDate':AppointmentDate == undefined?vals[k].AppointmentDate:AppointmentDate ,
                        'AppointmentTime':AppointmentTime == undefined?vals[k].AppointmentTime:AppointmentTime ,
                        'Status':Status == undefined?vals[k].Status:Status ,
                        'IsApprove':IsApprove == undefined?vals[k].IsApprove:IsApprove ,
                        'IsTreat':IsTreat == undefined?vals[k].IsTreat:IsTreat ,
                        'TreatBy':TreatBy == undefined?vals[k].TreatBy:TreatBy ,
                        'TreatDetail':TreatDetail == undefined?vals[k].TreatDetail:TreatDetail ,
                        'TreatDate':TreatDate == undefined?vals[k].TreatDate:TreatDate ,
                        'TreatTime':TreatTime == undefined?vals[k].TreatTime:TreatTime ,
                        'IsCancel':IsCancel == undefined?vals[k].IsCancel:IsCancel ,
                        'CancelReason':CancelReason == undefined?vals[k].CancelReason:CancelReason ,
                        'IsPostpone':IsPostpone == undefined?vals[k].IsPostpone:IsPostpone ,
                        'PostponeDate':PostponeDate == undefined?vals[k].PostponeDate:PostponeDate ,
                        'PostponeTime':PostponeTime == undefined?vals[k].PostponeTime:PostponeTime ,
                        'PostponeReason':PostponeReason == undefined?vals[k].PostponeReason:PostponeReason ,
                        'UpdateBy':UpdateBy == undefined?vals[k].UpdateBy:UpdateBy ,
                        'UpdateDate':day,
                    });
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

app.post('/DenOfArtMySqlRegister',(req,res,next)=> {
    console.log("HTTP POST Request :: Den of Art User Register on MySql");
    var post_data = req.body;  
    var name = post_data.username;  
    var email = post_data.email;
    
    var plain_password = post_data.password;  
    var password = encrypt(plain_password);

    var mobile = post_data.phonenumber; 
    var isExist = false;

    var sql = "INSERT INTO users (username, password, email, phone) VALUES ?";
    var values = [
        [name, password, email, mobile]
    ];

    mysql_con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        
    });
    res.sendStatus(200);
});

app.post('/DenOfArtMySqlUpdateProfile',(req,res,next)=> {
    console.log("HTTP POST Request :: Den of Art Update User Profile on MySql");
    var post_data = req.body;
    var UserName = post_data.username;
    var FirstName = post_data.firstname;
    var LastName = post_data.lastname;
    var Address1 = post_data.address1;
    var Address2 = post_data.address2;
    var Address3 = post_data.address3;
    var Email = post_data.email;
    var PhoneNumber = post_data.phonenumber;

    var sql = "UPDATE users SET firstname = '"+FirstName+"', lastname='"+LastName+"', address='"+Address1+" "+ Address2+" "+Address3+"' WHERE username = '"+UserName+"'";
    console.log('sql = ' + sql);
    mysql_con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    res.sendStatus(200);
});

function RegisterMySql(name, password, email, mobile){
    console.log("Function :: Den of Art User Register on MySql");
    var sql = "INSERT INTO users (username, password, email, phone) VALUES ?";
    var values = [
        [name, password, email, mobile]
    ];

    mysql_con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        
    });
    return;
}

function UpdateProfileMySql(username, firstname, lastname, address1, address2, address3){
    console.log("Function :: Den of Art Update User Profile on MySql");
    var sql = "UPDATE users SET firstname = '"+firstname+"', lastname='"+lastname+"', address='"+address1+" "+ address2+" "+address3+"' WHERE username = '"+username+"'";
    console.log('sql = ' + sql);
    mysql_con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });

    return;
}