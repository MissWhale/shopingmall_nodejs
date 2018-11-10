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
        app.use(bodyParser.urlencoded({extended:false}));
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
        app.get(['/','/pagenum=:pno'],function(req,res){ //상품페이지
                var maxpost=10; //페이지당 상품수
                var pno=req.params.pno; //페이지넘버
                if(!pno)  var pno=1;
                var start=maxpost*pno-maxpost;
                var sql="select count(*) as postcnt from product";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var postcnt=result[0].postcnt;
                                var sql="select product.*, productimg.*, min(optprice) as optprice from product join productimg using(num) join productopt using(num) group by product.num ORDER by product.num DESC limit ?,?;";
                                con.query(sql,[start,maxpost],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                var pager={
                                                        pagecnt:postcnt%maxpost == 0 ? Math.trunc(postcnt/maxpost) : Math.trunc(postcnt/maxpost) +1, //총페이지수
                                                        startpost:maxpost*pno-maxpost, //시작상품넘버
                                                        endpost:maxpost*pno-1< postcnt ?  maxpost*pno-1 : postcnt-1  //마지막상품넘버
                                                }
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('main',{name:dname,id:req.session.user,product:result,pager:pager,pno:pno});
                                                }else{
                                                        res.render('main',{product:result,pager:pager,pno:pno});
                                                }
                                        }
                                })
                        }
                })
        });
        app.get(['/productDetail','/productDetail?num=:pno'],function(req,res){ //상세정보페이지
                var pno=req.query.num;
                console.log(pno);
                var sql="select * from product join productimg using(num) where num=?"
                con.query(sql,pno,function(err,result){
                        if(err) console.log(err);
                        else{
                                var sql="select optcode,min(optprice) as min from productopt where num=?";
                                con.query(sql,pno,function(err,min){
                                        if(err) console.log(err);
                                        else{
                                                var sql="select * from productopt where num=?";
                                                con.query(sql,pno,function(err,opt){
                                                        if(err) console.log(err);
                                                        else{
                                                                if(req.session.displayname){
                                                                        var dname=req.session.displayname;
                                                                        res.render('prodetail',{name:dname,id:req.session.user,pro:result[0],opt:opt,min:min[0]});
                                                                }else{
                                                                        res.render('prodetail',{pro:result[0],opt:opt,min:min[0]});
                                                                }
                                                        }
                                                })
                                        }
                                })
                        }
                })
        })
        app.get(['/help','/help=:pno'],function(req,res){ //고객센터
                var maxpost=10; //페이지당 상품수
                var pno=req.params.pno; //페이지넘버
                if(!pno)  var pno=1;
                var start=maxpost*pno-maxpost;
                var sql="select count(*) as postcnt from faq";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var postcnt=result[0].postcnt;
                                var sql="select * from faq  ORDER by fnum DESC limit ?,?;";
                                con.query(sql,[start,maxpost],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                var pager={
                                                        pagecnt:postcnt%maxpost == 0 ? Math.trunc(postcnt/maxpost) : Math.trunc(postcnt/maxpost) +1, //총페이지수
                                                        startpost:maxpost*pno-maxpost, //시작상품넘버
                                                        endpost:maxpost*pno-1< postcnt ?  maxpost*pno-1 : postcnt-1  //마지막상품넘버
                                                }
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('help',{name:dname,id:req.session.user,faq:result,pager:pager,pno:pno});
                                                }else{
                                                        res.render('help',{faq:result,pager:pager,pno:pno});
                                                }
                                        }
                                })
                        }
                })
        })
}
{//회원정보###################################회원정보#####################################회원정보
        app.get('/information',function(req,res){ //개인정보수정
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
        app.get('/basket',function(req,res){ //장바구니
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('basket',{name:dname,id:req.session.user});
                }else{
                        res.render('basket');
                }
        })
        app.post("/passchange",function(req,res){ //비밀번호변경
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
        app.get(["/member","/member=:pno"],function(req,res){ //회원관리
                var maxpost=20; //페이지당 회원수
                var pno=req.params.pno; //페이지넘버
                if(!pno)  var pno=1;
                var start=maxpost*pno-maxpost;
                var sql="select count(*) as mbcnt from login";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var mbcnt=result[0].mbcnt;
                                var sql="select * from login order by id desc limit ?,?";
                                con.query(sql,[start,maxpost],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                var pager={
                                                        pagecnt:mbcnt%maxpost == 0 ? Math.trunc(mbcnt/maxpost) : Math.trunc(mbcnt/maxpost) +1, //총페이지수
                                                        startpost:maxpost*pno-maxpost, //시작상품넘버
                                                        endpost:maxpost*pno-1< mbcnt ?  maxpost*pno-1 : mbcnt-1  //마지막상품넘버
                                                }
                                                console.log(result);
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('member',{name:dname,id:req.session.user,result:result,pager:pager,pno:pno});
                                                }else{
                                                        res.render('member',{result:result,pager:pager,pno:pno});
                                                }
                                        }
                                })
                        }
                })
        })
        app.post("/memdel",function(req,res){ //회원삭제
                var id=req.body.id;
                var sql="delete from login where id=?";
                con.query(sql,id,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
        app.post("/memmodi",function(req,res){ //회원정보수정
                console.log(req.body);
                var mem={
                        pid:req.body.pid,
                        id:req.body.id,
                        pw:req.body.pw,
                        name:req.body.name,
                        phone:req.body.phone,
                        email:req.body.email,
                        birth:req.body.birth
                }
                var sql="update login set id=?,pw=?,name=?,phone=?,email=?,birth=? where id=?";
                con.query(sql,[mem.id,mem.pw,mem.name,mem.phone,mem.email,mem.birth,mem.pid],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
        app.get(["/product","/product=:pno"],function(req,res){ //상품관리페이지
                var maxpost=20; //페이지당 상품수
                var pno=req.params.pno; //페이지넘버
                if(!pno)  var pno=1;
                var start=maxpost*pno-maxpost;
                var sql="select count(*) as postcnt from product";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var postcnt=result[0].postcnt;
                                var sql="select * from product order by num desc limit ?,?";
                                con.query(sql,[start,maxpost],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                var pager={
                                                        pagecnt:postcnt%maxpost == 0 ? Math.trunc(postcnt/maxpost) : Math.trunc(postcnt/maxpost) +1, //총페이지수
                                                        startpost:maxpost*pno-maxpost, //시작상품넘버
                                                        endpost:maxpost*pno-1< postcnt ?  maxpost*pno-1 : postcnt-1  //마지막상품넘버
                                                }
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('product',{name:dname,id:req.session.user,result:result,pager:pager,pno:pno});
                                                }else{
                                                        res.render('product',{result:result,pager:pager,pno:pno});
                                                }
                                        }
                                })
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
                                        var sql="select simg from productimg where num=?";
                                        con.query(sql,num,function(err,result){
                                                if(err) console.log(err);
                                                else{
                                                        if(result[0].simg){
                                                                var simg=result[0].simg;
                                                                if (simg!="C:\\2-2\\shopingmall\\dbimg\\thumbnail.png"){
                                                                        fs.exists(simg,function(ex){ //썸네일 삭제
                                                                                if(ex){
                                                                                        fs.unlink(simg,function(err){
                                                                                                if(err) console.log(err);
                                                                        })}})
                                                                }
                                                                var sql="delete from productimg where num=? " //사진 db제거
                                                                con.query(sql,num,function(err,result){
                                                                        if(err) console.log(err);
                                                                        else{
                                                                                if(result.affectedRows) res.send(true);
                                                                                else res.send(false);
                                                                        }
                                                                })
                                                        }
                                                }
                                        })
                                }else res.send(false);
                        }
                })
        })
        app.get(["/productmodify",'/productmodify?:num'],function(req,res){ //상품수정페이지
                var num=req.query.num;
                var sql="select * from product natural join productimg where num=?";
                con.query(sql,num,function(err,pro){
                        if(err) console.log(err);
                        else{
                                var sql="select a.* from productopt a where num=?";
                                con.query(sql,num,function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('productmodify',{name:dname,id:req.session.user,pro:pro[0],opt:result});
                                                }else{
                                                        res.render('productmodify');
                                                }
                                        }
                                })
                        }
                })
        })
        app.post('/productmodify',function(req,res){ //상품수정
                var pro={
                        no:req.body.no,
                        name:req.body.name,
                        kind:req.body.kind,
                        num:req.body.num,
                        comp:req.body.comp,
                        count:req.body.count,
                        price:req.body.price,
                        text:req.body.text
                }
                var sql="update product set pkind=?,name=?,comp=?,ptext=? where num=?";
                con.query(sql,[pro.kind,pro.name,pro.comp,pro.text,pro.no],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.redirect('/product');
                                }else{
                                        res.send('<script>alert("수정이 실패하였습니다");location.back()"</script>');
                                }
                        }
                })
        })
        app.get("/productupload",function(req,res){ //판매등록페이지
                var sql="SHOW TABLE STATUS LIKE 'product'";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var sql="delete from productopt where num=?";
                                con.query(sql,result[0].Auto_increment,function(err,result){
                                        if (err) console.log(err);
                                })
                        }
                })
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
                        comp:req.body.comp,
                        // text:encodeURIComponent(req.body.text)
                        text:req.body.text
                }
                var sql='insert into product(pkind,name,comp,ptext) values(?,?,?,?)';
                con.query(sql,[pro.kind,pro.name,pro.comp,pro.text],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.redirect('/product');
                                }
                        }
                })
        })
        app.post("/noimg",function(req,res){ //썸네일없음
                var no=req.body.no;
                var simg="C:\\2-2\\shopingmall\\img\\thumbnail.png";
                var simgorigin="thumbnail.png";
                var simgname="thumbnail.png";
                var sql='insert into productimg(simg,simgorigin,simgname,num) values(?,?,?,?)';
                con.query(sql,[simg,simgorigin,simgname,no],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
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
                var sql="select simg,count(*) as count from productimg where num=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                var count=result[0].count;
                                var simg=result[0].simg;
                                if(count){
                                        fs.exists(simg,function(ex){ //기존썸네일 삭제
                                                if(ex){
                                                        fs.unlink(simg,function(err){
                                                                if(err) console.log(err);
                                        })}})
                                        var sql="update productimg set simg=?,simgorigin=?,simgname=? where num=?";
                                        con.query(sql,[file.path,file.origin,file.name,num],function(err,result){
                                                if(err) console.log(err);
                                                else{
                                                        if(result.affectedRows){
                                                                res.send({"src":file.name});
                                                        }else res.send();
                                                }
                                        })
                                }else{
                                        var sql='insert into productimg(simg,simgorigin,simgname,num) values(?,?,?,?)';
                                        con.query(sql,[file.path,file.origin,file.name,num],function(err,result){
                                                if(err) console.log(err);
                                                else{
                                                        if(result.affectedRows){
                                                                res.send({"src":file.name});
                                                        }else res.send();
                                                }
                                        })
                                }
                        }
                })
        })
        app.post("/bimgdb",upload.single('upload'),function(req,res){ //이미지업로드
                if(req.file){
                        var file={
                                path:req.file.path,
                                origin:req.file.originalname,
                                name:req.file.filename
                        }
                        res.send({
                                "uploaded":1,
                                "filename":file.origin,
                                "url":'/dbimg/'+file.name,
                                "error":{
                                        "message":"업로드 성공"
                        }});
                }else{
                        res.send({
                                "uploaded":0,
                                "error":{
                                        "message":"업로드 실패"
                        }});
                }
        })
        app.post("/optadd",function(req,res){ //옵션추가
                var opt={
                        code:req.body.code,
                        name:req.body.name,
                        cnt:req.body.cnt,
                        price:req.body.price,
                        num:req.body.num
                }
                var sql="insert into productopt(optcode,optname,optprice,optcnt,num) values(?,?,?,?,?)";
                con.query(sql,[opt.code,opt.name,opt.price,opt.cnt,opt.num],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
        app.post("/optmodi",function(req,res){ //옵션수정
                var num=req.body.num;
                var opt={
                        code:req.body.code,
                        name:req.body.name,
                        cnt:req.body.cnt,
                        price:req.body.price,
                        num:req.body.num
                }
                var sql="update productopt set optcode=?,optname=?,optprice=?,optcnt=? where optnum=?";
                con.query(sql,[opt.code,opt.name,opt.price,opt.cnt,opt.num],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
        app.post("/optdel",function(req,res){ //옵션삭제
                var num=req.body.num;
                var sql="delete from productopt where optnum=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
        app.post("/getoptnum",function(req,res){ //Auto_increment Option Get
                var sql="SHOW TABLE STATUS LIKE 'productopt'";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                res.send({num:result[0].Auto_increment});
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
        app.get("/order",function(req,res){ //주문관리
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('order',{name:dname,id:req.session.user});
                }else{
                        res.render('order');
                }
        })
        app.get(["/faq","/faq=:pno"],function(req,res){ //faq페이지
                var maxpost=20; //페이지당 상품수
                var pno=req.params.pno; //페이지넘버
                if(!pno)  var pno=1;
                var start=maxpost*pno-maxpost;
                var sql="select count(*) as postcnt from faq";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                var postcnt=result[0].postcnt;
                                var sql="select * from faq order by fnum desc limit ?,?";
                                con.query(sql,[start,maxpost],function(err,result){
                                        if(err) console.log(err);
                                        else{
                                                var pager={
                                                        pagecnt:postcnt%maxpost == 0 ? Math.trunc(postcnt/maxpost) : Math.trunc(postcnt/maxpost) +1, //총페이지수
                                                        startpost:maxpost*pno-maxpost, //시작상품넘버
                                                        endpost:maxpost*pno-1< postcnt ?  maxpost*pno-1 : postcnt-1  //마지막상품넘버
                                                }
                                                if(req.session.displayname){
                                                        var dname=req.session.displayname;
                                                        res.render('faq',{name:dname,id:req.session.user,result:result,pager:pager,pno:pno});
                                                }else{
                                                        res.render('faq',{result:result,pager:pager,pno:pno});
                                                }
                                        }
                                })
                        }
                })
        })
        app.get("/faqupload",function(req,res){ //faq등록페이지
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('faqupload',{name:dname,id:req.session.user});
                }else{
                        res.render('faqupload');
                }
        })
        app.post("/faqupload",function(req,res){ //faq등록
                console.log(req.body);
                var title=req.body.title;
                var text=req.body.text;
                var sql="insert into faq(ftitle,ftext) values(?,?)";
                con.query(sql,[title,text],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.redirect("/faq");
                                }else{
                                        res.send('<script>alert("faq등록이 실패하였습니다");location.href="/faq"</script>');
                                }
                        }
                })
        })
        app.get(["/faqmodify","/faqmodify=:num"],function(req,res){ //faq수정페이지
                var num=req.query.num;
                var sql="select * from faq where fnum=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                console.log(result);
                                if(result){
                                        if(req.session.displayname){
                                                var dname=req.session.displayname;
                                                res.render('faqmodify',{name:dname,id:req.session.user,faq:result[0]});
                                        }else{
                                                res.render('faqmodify');
                                        }
                                }else{
                                        res.send('<script>alert("faq 수정 오류!!");location.href="/faq"</script>');
                                }
                        }
                })
        })
        app.post("/faqmodify",function(req,res){ //faq수정
                var num=req.body.num;
                var title=req.body.title;
                var text=req.body.text;
                var sql="update faq set ftitle=?,ftext=? where fnum=?";
                con.query(sql,[title,text,num],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send('<script>alert("수정 완료!!");location.href="/faq"</script>');
                                }else{
                                        res.send('<script>alert("수정 오류!!");location.href="/faq"</script>');
                                }
                        }
                })
        })
        app.post("/faqdelete",function(req,res){ //faq삭제
                var num=req.body.num;
                var sql="delete from faq where fnum=?";
                con.query(sql,num,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(result.affectedRows){
                                        res.send("true");
                                }else{
                                        res.send("false");
                                }
                        }
                })
        })
}
{ //로그인###################################로그인######################################로그인
        app.get('/login',function(req,res){ //로그인페이지
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('login',{name:dname,id:req.session.user});
                }else{
                        res.render('login');
                }
        });
        app.post('/login',function(req,res){ //로그인
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
        app.get('/logout',function(req,res){ //로그아웃
                delete req.session.displayname;
                req.session.save(function(){
                        res.redirect('/');
                })
        })
}
{//회원가입###################################회원가입#####################################회원가입
        app.get('/register',function(req,res){ //회원가입
                if(req.session.displayname){
                        var dname=req.session.displayname;
                        res.render('login',{name:dname,id:req.session.user});
                }else{
                        res.render('login',{regiok:true});
                }
        })
        app.post("/idcheck",function(req,res){ //아이디중복확인
                var id=req.body.id;
                var sql='select count(*) as result from login where id=?';
                con.query(sql,id,function(err,result){
                        if(err) console.log(err);
                        else{
                                res.send({"result":result[0].result})
                        }
                })
        })
        app.post("/emailcheck",function(req,res){ //이메일중복확인
                var email=req.body.email;
                var sql='select count(*) as result from login where email=?';
                con.query(sql,email,function(err,result){
                        if(err) console.log(err);
                        else{
                                res.send({"result":result[0].result})
                        }
                })
        })
        app.post('/register',function(req,res){ //회원가입
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