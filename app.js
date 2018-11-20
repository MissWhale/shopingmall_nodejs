{//서버설정###################################서버설정#####################################서버설정
        var express=require('express');
        var bodyParser=require('body-parser')
        var app=express();
        var mysql=require('mysql');
        var session=require('express-session');
        var mss=require('express-mysql-session')(session);
        var option={
                host:'114.71.137.109',
                port:3306,
                user:'root',
                password:'tmvlflt1234',
                database:'Mok2',
                charset:'utf8'
        }
        var sstore=new mss(option);
        var con=mysql.createConnection({
                host:'114.71.137.109',
                user:'root',
                password:'tmvlflt1234',
                database:'Mok2',
                charset:'utf8'
        })
        con.connect();
        app.locals.pretty=true;
        app.set('view engine','jade');
        app.set('views',["./views/user","./views/manager"]);
        app.use(express.static(__dirname+'/css'));
        app.use("/css", express.static(__dirname + '/css'));
        app.use(express.static(__dirname+'/img'));
        app.use("/img", express.static(__dirname + '/img'));
        app.use(express.static(__dirname+'/js'));
        app.use("/js", express.static(__dirname + '/js'));
        app.use("/dbimg", express.static(__dirname + '/dbimg'));
        app.use(bodyParser.urlencoded({extended:false}));
        app.use(bodyParser.json());
        app.use(session({
                secret:'test',
                resave:false,
                saveUninitialized:true,
                store:sstore
        }));
        app.use('/admin/', require('./route/controller/adminctr'));
        app.use('/login/', require('./route/controller/loginctr'));
        app.use('/user/', require('./route/controller/userctr'));
        app.use('/', require('./route/controller/mainctr'));
        app.listen(3000,function(){
                console.log('Conneted 3000 port');
        });
}
{//함수###################################함수######################################함수
Date.prototype.format = function(f) {
        if (!this.valueOf()) return " ";
        var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        var d = this;
        return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
                switch ($1) {
                        case "yyyy": return d.getFullYear();
                        case "yy": return (d.getFullYear() % 1000).zf(2);
                        case "MM": return (d.getMonth() + 1).zf(2);
                        case "dd": return d.getDate().zf(2);
                        case "E": return weekName[d.getDay()];
                        case "HH": return d.getHours().zf(2);
                        case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
                        case "mm": return d.getMinutes().zf(2);
                        case "ss": return d.getSeconds().zf(2);
                        case "a/p": return d.getHours() < 12 ? "오전" : "오후";
                        default: return $1;
                }
        });
};
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
}