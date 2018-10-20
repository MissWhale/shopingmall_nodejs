{//서버설정###################################서버설정#####################################서버설정
        var express=require('express');
        var bodyParser=require('body-parser')
        var app=express();
        var mysql=require('mysql');
        var session=require('express-session');
        var multer=require('multer');
        var fs=require('fs');
        var upload=multer({storage: multer.diskStorage({
                destination: function (req, file, cb) {
                  cb(null, __dirname+'/dbimg/');
                },
                filename: function (req, file, cb) {
                  cb(null, Date.now()+"-"+file.originalname);
                }
        }),});
        var mss=require('express-mysql-session')(session);
        { //mysql
        // var option={
        //         host:'127.0.0.1',
        //         port:3306,
        //         user:'root',
        //         password:'root',
        //         database:'shoping'
        // }
        // var sstore=new mss(option);
        // var con=mysql.createConnection({
        //         host:'127.0.0.1',
        //         user:'root',
        //         password:'root',
        //         database:'shoping'
        // })
        }
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
        app.use(bodyParser.urlencoded({extended:false}))
        app.use(session({
                secret:'test',
                resave:false,
                saveUninitialized:true,
                store:sstore
        }));
        app.listen(3000,function(){
                console.log('Conneted 3000 port');
        });
}
{//라우팅###################################라우팅#####################################라우팅
        app.get('/',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('main',{name:dname,id:req.session.user});
                }else{
                        res.render('main');
                }
        });
        app.get('/help',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('help',{name:dname,id:req.session.user});
                }else{
                        res.render('help');
                }
        })
}
{//회원정보###################################회원정보#####################################회원정보
        app.get('/information',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        var sql="select * from login where id=?";
                        con.query(sql,req.session.user,function(err,result){
                                if(err) console.log(err);
                                else{
                                        var test=new Date(result[0].birth).format("yyyy-MM-dd");
                                        res.render('ifm',{name:dname,user:result[0],birth:test,id:req.session.user});
                                }
                        });
                }else{
                        res.render('ifm',{regiok:true});
                }
        });
        app.get('/basket',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('basket',{name:dname,id:req.session.user});
                }else{
                        res.render('basket');
                }
        })
        app.post("/passchange",function(req,res){
                var pw={
                        pw:req.body.pw,
                        newpw:req.body.newpw,
                        id:req.session.user
                }
                var sql="select count(*) as result from login where id=? and pw=?";
                con.query(sql,[pw.id,pw.pw],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result[0].result){
                                        var sql="update login set pw=? where id=? and pw=?";
                                        con.query(sql,[pw.newpw,pw.id,pw.pw],function(err,result){
                                                if(err) console.log(err);
                                                else{
                                                        res.send(true);
                                                }
                                        });
                                }else{
                                        res.send(false);
                                }
                        }
                });
        })
}
{//관리자###################################관리자######################################관리자
        app.get("/management",function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('management',{name:dname,id:req.session.user});
                }else{
                        res.render('management');
                }
        })
        app.get("/product",function(req,res){
                var sql="select *  from product";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(req.session.displayname){
                                        var dname=req.session.displayname;
                                        res.render('product',{name:dname,id:req.session.user,result:result});
                                }else{
                                        res.render('product',{result:result});
                                }
                        }
                })
        })
        app.post("/productdelete",function(req,res){ //상품 삭제
                var num=req.body.num;
                var sql="delete from product where num=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        var sql="select simg,bimg from productimg where num=?";
                                        con.query(sql,num,function(err,result){
                                                if(err) console.log(err);
                                                else{
                                                        var simg=result[0].simg;
                                                        var bimg=result[0].bimg;
                                                        fs.exists(simg,function(ex){ //썸네일 삭제
                                                                if(ex){
                                                                        fs.unlink(simg,function(err){
                                                                                if(err) console.log(err);
                                                        })}})
                                                        fs.exists(bimg,function(ex){ //이미지 삭제
                                                                if(ex){
                                                                        fs.unlink(bimg,function(err){
                                                                                if(err) console.log(err);
                                                        })}})
                                                        var sql="delete from productimg where num=? " //사진 db제거
                                                        con.query(sql,num,function(err,result){
                                                                if(err) console.log(err);
                                                                else{
                                                                        if(result.affectedRows) res.send(true);
                                                                        else res.send(false);
                                                                }
                                                        })
                                                }
                                        })
                                }else res.send(false);
                        }
                })
        })
        app.get(["/productmodify",'/productmodify?:num'],function(req,res){ //상품수정
                var num=req.query.num;
                var sql="select * from product natural join productimg where num=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(req.session.displayname){
                                        var dname=req.session.displayname;
                                        res.render('productmodify',{name:dname,id:req.session.user,result:result[0]});
                                }else{
                                        res.render('productmodify');
                                }
                        }
                })
        })
        app.get("/productupload",function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('productupload',{name:dname,id:req.session.user});
                }else{
                        res.render('productupload');
                }
        })
        app.post("/productupload",function(req,res){ //판매등록
                var pro={
                        name:req.body.name,
                        kind:req.body.kind,
                        num:req.body.num,
                        comp:req.body.comp,
                        count:req.body.count,
                        price:req.body.price,
                        text:req.body.text,
                }
                var sql='insert into product(pkind,pnum,name,comp,count,price,ptext) values(?,?,?,?,?,?,?)';
                con.query(sql,[pro.kind,pro.num,pro.name,pro.comp,pro.count,pro.price,pro.text],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.redirect('/product');
                                }
                        }
                })
        })
        app.post("/simgdb",upload.single('simg'),function(req,res){ //썸네일업로드
                var file={
                        path:req.file.path,
                        origin:req.file.originalname,
                        name:req.file.filename
                }
                var num=req.body.no;
                console.log(req);
                // var sql='insert into productimg(simg,simgorigin,simgname,num) values(?,?,?,?)';
                // con.query(sql,[file.path,file.origin,file.name,num],function(err,result){
                //         if(err) console.log(err);
                //         else{
                //                 if(result.affectedRows){
                //                         res.send("true");
                //                 }else res.send("false");
                //         }
                // })
        })
        app.post("/bimgdb",upload.single('bimg'),function(req,res){ //이미지업로드
                var file={
                        path:req.file.path,
                        origin:req.file.originalname,
                        name:req.file.filename
                }
                var num=req.body.bno;
                var sql="select count(*) as result from productimg where num=?"
                con.query(sql,num,function(err,result){
                        if(result[0].result){
                                var sql="update productimg set bimg=?,bimgorigin=?,bimgname=? where num=?"
                                con.query(sql,[file.path,file.origin,file.name,num],function(err,result){
                                        if(err) console.log(err);
                                        else res.send(true);
                                })
                        }else{
                                var sql='insert into productimg(bimg,bimgorigin,bimgname,num) values(?,?)';
                                con.query(sql,[file.path,file.origin,file.name,num],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                if(result.affectedRows){
                                                        res.send("true");
                                                }else res.send("false");
                                        }
                                })
                        }
                })
        })
        app.post("/getnum",function(req,res){ //Auto_increment Get
                var sql="SHOW TABLE STATUS LIKE 'product'";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                res.send({num:result[0].Auto_increment});
                        }
                })
        })
        app.get("/order",function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('order',{name:dname,id:req.session.user});
                }else{
                        res.render('order');
                }
        })
        app.get("/faq",function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('faq',{name:dname,id:req.session.user});
                }else{
                        res.render('faq');
                }
        })
}
{ //로그인###################################로그인######################################로그인
        app.get('/login',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('login',{name:dname,id:req.session.user});
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
        });
        app.get('/logout',function(req,res){
                delete req.session.displayname;
                req.session.save(function(){
                        res.redirect('/');
                })
        })
}
{//회원가입###################################회원가입#####################################회원가입
        app.get('/register',function(req,res){
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('login',{name:dname,id:req.session.user});
                }else{
                        res.render('login',{regiok:true});
                }
        })
        app.post("/idcheck",function(req,res){
                var id=req.body.id;
                var sql='select count(*) as result from login where id=?';
                con.query(sql,id,function(err,result){
                        if(err) console.log(err);
                        else{
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
                        birthday:req.body.birth,
                        phone:req.body.phone
                }
                var sql='insert into login(id,pw,email,name,birth,phone,status) values(?,?,?,?,?,?,1)';
                con.query(sql,[user.id,user.pw,user.email,user.name,user.birthday,user.phone],function(err,result){
                        if(err) console.log(err);
                        else{
                                var ok=result.affectedRows;
                                if(ok==1){
                                        res.send('<script>alert("회원가입에 성공하셧습니다.");location.href="/login"</script>');
                                }else{
                                        res.send('<script>alert("회원가입을 실패하셨습니다.");history.back();</script>',{result:ok});
                                }
                        }
                })
        })
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
{//잡###################################잡######################################잡
// app.post('/register',function(req,res){
//         var user={
//                 id:req.body.id,
//                 pw:req.body.pw,
//                 email:req.body.email,
//                 name:req.body.name,
//                 birth:req.body.birth,
//                 number:req.body.phone
//         }
//         var sql="insert into login(id,pw,email,name,phone,birth,status) values (?,?,?,?,?,?,1)"
//         con.query(sql,[user.id,user.pw,user.email,user.name,user.number,user.birth],function(err,result){
//                 if(err) console.log(err);
//                 else{
//                         var ok=result.affectedRows;
//                         if(ok==1){
//                                 res.send('<script>alert("회원가입에 성공하셧습니다.");location.href="/login";</script>');
//                         }else{
//                                 res.send('<script>alert("회원가입을 실패하셨습니다.");location.href="/login";</script>',);
//                         }
//                 }
//         })
// })
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
}