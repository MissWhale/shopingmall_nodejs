var express=require('express');
var bodyParser=require('body-parser')
var app=express();
var mysql=require('mysql');
var session=require('express-session');
var mss=require('express-mysql-session')(session);
var option={
    host:'127.0.0.1',
    port:3306,
    user:'root',
    password:'root',
    database:'shoping'
}
var sstore=new mss(option);
var con=mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    database:'shoping'
})
con.connect();
app.locals.pretty=true;
app.set('view engine','jade');
app.set('views','./views');
app.use(express.static(__dirname+'/css'));
app.use("/css", express.static(__dirname + '/css'));
app.use(express.static(__dirname+'/img'));
app.use("/img", express.static(__dirname + '/img'));
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({
    secret:'test',
    resave:false,
    saveUninitialized:true,
    store:sstore
}));
app.get('/',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        res.render('main',{name:dname});
    }else{
        res.render('main');
    }
});
app.get('/register',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        res.render('login',{name:dname});
    }else{
        res.render('login',{regiok:true});
    }
})
app.get('/information',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        var sql="select * from login where id=?";
        con.query(sql,req.session.user,function(err,result){
            if(err) console.log(err);
            else{
                var test=new Date(result[0].birth).format("yyyy-MM-dd");
                res.render('ifm',{name:dname,user:result[0],birth:test});
            }
        });
        // res.render('ifm',{name:dname});
    }else{
        res.render('ifm',{regiok:true});
    }
});

app.get('/basket',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        res.render('basket',{name:dname});
    }else{
        res.render('basket');
    }
})
app.get('/help',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        res.render('help',{name:dname});
    }else{
        res.render('help');
    }
})
app.get('/login',function(req,res){
    if(req.session.displayname){
        var dname=req.session.displayname;
        res.render('login',{name:dname});
    }else{
        res.render('login');
    }
});
app.post('/login',function(req,res){
    var user={
        id:req.body.id,
        pw:req.body.pw
    }
    var sql='select count(*) as ok,name from login where id=? and pw=?';
    con.query(sql,[user.id,user.pw],function(err,result){
        if(err) console.log(err);
        else{
            var ok=result[0].ok;
            if(ok==1){
                req.session.displayname=result[0].name;
                req.session.user=user.id;
                req.session.save(function(){
                    res.redirect('/');
                })
            }else{
                res.send('<script>alert("아이디나 비밀번호가 일치하지 않습니다");location.href="/login"</script>');
            }
        }
    })
})
app.post('/register',function(req,res){
    var user={
        id:req.body.id,
        pw:req.body.pw,
        email:req.body.email,
        name:req.body.name,
        birth:req.body.birth,
        number:req.body.phone
    }
    var sql="insert into login(id,pw,email,name,phone,birth,status) values (?,?,?,?,?,?,1)"
    con.query(sql,[user.id,user.pw,user.email,user.name,user.number,user.birth],function(err,result){
        if(err) console.log(err);
        else{
            var ok=result.affectedRows;
            if(ok==1){
                res.send('<script>alert("회원가입에 성공하셧습니다.");location.href="/login";</script>');
            }else{
                res.send('<script>alert("회원가입을 실패하셨습니다.");location.href="/login";</script>',);
            }
        }
    })
})
app.post("/idcheck",function(req,res){
    var id=req.body.id;
    var sql='select count(*) as result from login where id=?';
    con.query(sql,id,function(err,result){
        if(err) console.log(err);
        else{
            // console.log(result[0].result);
            res.send({"result":result[0].result})
        }
    })
})
app.post("/emailcheck",function(req,res){
    var email=req.body.email;
    var sql='select count(*) as result from login where email=?';
    con.query(sql,email,function(err,result){
        if(err) console.log(err);
        else{
            // console.log(result[0].result);
            res.send({"result":result[0].result})
        }
    })
})
app.post('/register',function(req,res){
    var user={
        id:req.body.id,
        pw:req.body.pw,
        email:req.body.email,
        name:req.body.name,
        location:req.body.location,
        birthday:req.body.birthday
    }
    var sql='insert into login(id,pw,email,name,location,birthday,status) values(?,?,?,?,?,?,1)';
    con.query(sql,[user.id,user.pw,user.email,user.name,user.location,user.birthday],function(err,result){
        if(err) console.log(err);
        else{
            var ok=result.affectedRows;
            console.log(ok);
            if(ok==1){
                res.send('<script>alert("회원가입에 성공하셧습니다.");location.href="/login"birthday;</script>');
            }else{
                res.send('<script>alert("회원가입을 실패하셨습니다.");history.back();</script>',{result:ok});
            }
        }
    })
})
app.get('/logout',function(req,res){
    delete req.session.displayname;
    req.session.save(function(){
        res.redirect('/');
    })
})
// app.get(['/login','/login/:bno'],function(req,res){
//     var sql='select * from tbl_board';
//     con.query(sql,function(err,row,field){
//         // res.send(row);
//         var bno=req.params.bno;
//         if(bno){
//             var sql="select * from tbl_board where bno=?"
//             con.query(sql,[bno],function(err,row,field){
//                 if(err) console.log(err);
//                 else res.render('view',{row:row,rowd:row[0]});
//             });
//         }else{
//             res.render('view',{row:row});
//         }
//     });
// })
app.listen(3000,function(){
    console.log('Conneted 3000 port');
});
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
