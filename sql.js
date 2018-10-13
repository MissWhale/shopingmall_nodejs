var sql=require('mysql');
var con=sql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    database:'test'
})
con.connect();