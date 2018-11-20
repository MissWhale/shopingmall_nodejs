var mysql=require('mysql');
var fs=require('fs');
var con=mysql.createConnection({
        host:'114.71.137.109',
        user:'root',
        password:'tmvlflt1234',
        database:'Mok2',
        charset:'utf8'
})
con.connect();
exports.member=function(req,res){ //회원관리
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
};
exports.memdel=function(req,res){ //회원삭제
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
};
exports.memmodi=function(req,res){ //회원정보수정
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
};
exports.product=function(req,res){ //상품관리페이지
        var maxpost=20; //페이지당 상품수
        var pno=req.params.pno; //페이지넘버
        if(!pno)  var pno=1;
        var start=maxpost*pno-maxpost;
        var sql="select count(*) as postcnt from product";
        con.query(sql,function(err,result){
                if(err) console.log(err);
                else{
                        var postcnt=result[0].postcnt;
                        var sql="select product.*,optcode,optcnt,min(optprice) as optprice from product join productopt using(num) group by product.num ORDER by product.num DESC limit ?,?";
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
};
exports.prodel=function(req,res){ //상품 삭제
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
};
exports.promodi=function(req,res){ //상품수정페이지
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
};
exports.promodify=function(req,res){ //상품수정
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
                                res.redirect('/admin/product');
                        }else{
                                res.send('<script>alert("수정이 실패하였습니다");location.back()"</script>');
                        }
                }
        })
};
exports.proupload=function(req,res){ //상품등록페이지
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
};
exports.prouploadpost=function(req,res){ //상품등록
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
                                res.redirect('/admin/product');
                        }
                }
        })
};
exports.noimg=function(req,res){ //썸네일없음
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
};
exports.simgupload=function(req,res){ //썸네일업로드
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
};
exports.bimgupload=function(req,res){ //이미지업로드
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
};
exports.optadd=function(req,res){ //옵션추가
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
};
exports.optmodi=function(req,res){ //옵션수정
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
};
exports.optdel=function(req,res){ //옵션삭제
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
};
exports.getoptnum=function(req,res){ //Auto_increment Option Get
        var sql="SHOW TABLE STATUS LIKE 'productopt'";
        con.query(sql,function(err,result){
                if(err) console.log(err);
                else{
                        res.send({num:result[0].Auto_increment});
                }
        })
};
exports.getnum=function(req,res){ //Auto_increment Get
        var sql="SHOW TABLE STATUS LIKE 'product'";
        con.query(sql,function(err,result){
                if(err) console.log(err);
                else{
                        res.send({num:result[0].Auto_increment});
                }
        })
};
exports.order=function(req,res){ //주문관리
        var maxpost=20; //페이지당 상품수
        var pno=req.params.pno; //페이지넘버
        if(!pno)  var pno=1;
        var start=maxpost*pno-maxpost;
        var sql="select count(*) as postcnt from orders";
        con.query(sql,function(err,result){
                if(err) console.log(err);
                else{
                        var postcnt=result[0].postcnt;
                        var sql="select orders.onum,ordersdetail.num,order_date,cnt,total,name,optname,optprice,status from orders join ordersdetail using(onum) join product using(num) join productopt using(num) group by orders.onum desc limit ?,?";
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
                                                res.render('order',{name:dname,id:req.session.user,orders:result,pager:pager,pno:pno});
                                        }else{
                                                res.render('order',{result:result,pager:pager,pno:pno});
                                        }
                                }
                        })
                }
        })
};
exports.faq=function(req,res){ //faq페이지
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
};
exports.faqupload=function(req,res){ //faq등록페이지
        if(req.session.displayname){
                var dname=req.session.displayname;
                res.render('faqupload',{name:dname,id:req.session.user});
        }else{
                res.render('faqupload');
        }
};
exports.faquploadpost=function(req,res){ //faq등록
        console.log(req.body);
        var title=req.body.title;
        var text=req.body.text;
        var sql="insert into faq(ftitle,ftext) values(?,?)";
        con.query(sql,[title,text],function(err,result){
                if(err) console.log(err);
                else{
                        if(result.affectedRows){
                                res.redirect("/admin/faq");
                        }else{
                                res.send('<script>alert("faq등록이 실패하였습니다");location.href="/faq"</script>');
                        }
                }
        })
};
exports.faqmodi=function(req,res){ //faq수정페이지
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
};
exports.faqmodify=function(req,res){ //faq수정
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
};
exports.faqdel=function(req,res){ //faq삭제
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
};