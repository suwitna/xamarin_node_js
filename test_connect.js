var mysql = require('mysql');

var con = mysql.createConnection({
    host: "103.22.183.220",
    user: "smomscic_doaCode",
    password: "jG4rti7iw",
    database: "smomscic_doaCode"
});

con.connect(function(err) {
    if (err) throw err;
        console.log("Connected Success!");
});