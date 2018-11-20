var mysql=require('mysql');
var con=mysql.createConnection({
        host:'114.71.137.109',
        user:'root',
        password:'tmvlflt1234',
        database:'Mok2',
        charset:'utf8'
})
con.connect();
exports.information=function(req,res){ //개인정보수정
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
};
exports.basket=function(req,res){ //장바구니
        var id=req.session.user;
        var sql="select * from basket join productopt using(optnum),product,productimg where id=? and basket.num=product.num and product.num=productimg.num order by bnum";
        con.query(sql,id,function(err,result){
                if(err) console.log(err);
                else{
                        if(req.session.displayname){
                                var dname=req.session.displayname;
                                res.render('basket',{name:dname,id:req.session.user,basket:result});
                        }else{
                                res.render('basket');
                        }
                }
        })
};
exports.basdel=function(req,res){ //장바구니삭제
        if(req.body.length){
                if(req.body.length>1){
                        for(var i=0;i<req.body.length;i++){
                                var sql="delete from basket where bnum=?";
                                con.query(sql,req.body['num[]'][i],function(err,result){
                                        if(err) console.log(err);
                                })
                        }
                        res.send('true');
                }else{
                        var num=req.body.num;
                        var sql="delete from basket where bnum=?";
                        con.query(sql,req.body['num[]'],function(err,result){
                                if(err) console.log(err);
                                else{
                                        if(result.affectedRows){
                                                res.send("true");
                                        }else{
                                                res.send("false");
                                        }
                                }
                        })
                }
        }
        else{
                var num=req.body.num;
                var sql="delete from basket where bnum=?";
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
        }
};
exports.passchange=function(req,res){ //비밀번호변경
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
};
exports.paymentget=function(req,res){ //결제페이지
        if(req.session.displayname){
                var dname=req.session.displayname;
                res.render('payment',{name:dname,id:req.session.user});
        }else{
                res.render('payment');
        }
};
exports.paymentpost=function(req,res){ //장바구니>>결제페이지
        var num=0;
        console.log(req.body);
        if(req.body.all>0){
                var bnum=JSON.stringify(req.body.post);
                var pcnt=bnum.substring(bnum.indexOf("cnt",0)+6,bnum.length-2);
                var bnums=bnum.substring(bnum.indexOf("bnum",0)+9,bnum.indexOf("cnt",0)-4).split(",");
                for(var i=0;i<bnums.length;i++){
                        bnums[i]=bnums[i].replace(/[^0-9]/g,'');
                }
                var sql="SELECT distinct product.num,name,productopt.optnum,optname,optprice,simgname,basket.cnt from product,productopt,productimg,basket where product.num=productimg.num and product.num=productopt.num and product.num in ";
                var sql2='';
                for(var i=0;i<pcnt;i++){
                        sql2=sql2+"bnum="+bnums[i];
                        if(i==pcnt-1){
                                break;
                        }else{
                                sql2=sql2+" or ";
                        }
                }
                var sql=sql+"(SELECT num from basket where ";
                var sql=sql+sql2+") and productopt.optnum in(SELECT optnum from basket where ";
                var sql=sql+sql2+") and (";
                var sql=sql+sql2+")";
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(req.session.displayname){
                                        var dname=req.session.displayname;
                                        res.render('payment',{name:dname,id:req.session.user,pay:result,isnum:"2"});
                                }else{
                                        res.render('payment');
                                }
                        }
                })
        }
        else if(req.body.isnum){
                for(var i=0;i<req.body.optnum.length;i++){
                        if(req.body.isnum==req.body.optnum[i]){
                                num=i;
                                break;
                        }
                }
                if(num || req.body.optnum.length){
                        var data={
                                num:req.body.num[num],
                                cnt:req.body.cnt[num],
                                optnum:req.body.optnum[num]
                        }
                }else{
                        var data={
                                num:req.body.num,
                                cnt:req.body.cnt,
                                optnum:req.body.optnum
                        }
                }
                var sql="SELECT product.num,name,optnum,optname,optprice,simgname FROM product,productopt,productimg where product.num=productimg.num and product.num=productopt.num and product.num=? and optnum=?";
                con.query(sql,[data.num,data.optnum],function(err,result){
                        if(err) console.log(err);
                        else{
                                if(req.session.displayname){
                                        var dname=req.session.displayname;
                                        res.render('payment',{name:dname,id:req.session.user,pay:result[0],cnt:data.cnt,isnum:"1"});
                                }else{
                                        res.render('payment');
                                }
                        }
                })
        }else{
                var sql="SELECT product.num,name,optnum,optname,optprice,simgname FROM product,productopt,productimg where product.num=productimg.num and product.num=productopt.num and ";
                var sql2="";
                if(req.body.lcnt>1){
                        for(var i=0;i<req.body.lcnt;i++){
                        // for(var i=0;i<req.body.optnum.length;i++){
                                sql2=sql2+"(product.num="+req.body.num[i]+" and optnum="+req.body.optnum[i]+") or ";
                        }
                        sql2=sql2.slice(0,-3);
                        sql=sql+"("+sql2+")";
                }else{
                        sql=sql+"product.num="+req.body.num+" and optnum="+req.body.optnum;
                }
                con.query(sql,function(err,result){
                        if(err) console.log(err);
                        else{
                                if(req.session.displayname){
                                        var dname=req.session.displayname;
                                        console.log(result);
                                        res.render('payment',{name:dname,id:req.session.user,pay:result,cnt:req.body.cnt,isnum:"2"});
                                }else{
                                        res.render('payment');
                                }
                        }
                })
        }
};
exports.orderadd=function(req,res){ //주문정보삽입
        var data={
                id:req.session.user,
                total:req.body.total,
                aname:req.body.aname,
                aphone:req.body.aphone,
                locnum:req.body.locnum,
                locadd:req.body.locadd,
                locdetail:req.body.locdetail,
                oname:req.body.oname,
                ophone:req.body.ophone
        }
        var sql="insert into orders(id,total,a_name,a_phone,oname,ophone,locnum,locadd,locdetail) values(?,?,?,?,?,?,?,?,?)";
        con.query(sql,[data.id,data.total,data.aname,data.aphone,data.oname,data.ophone,data.locnum,data.locadd,data.locdetail],function(err,result){
                if(err) console.log(err);
                else{
                        var innum=result.insertId;
                        for(var i=0;i<req.body.tocnt;i++){
                                var sql="insert into ordersdetail(num,onum,optnum,cnt) values(?,?,?,?)";
                                con.query(sql,[req.body.num[i],innum,req.body.optnum[i],req.body.cnt[i]],function(err,result){
                                        if(err) console.log(err);
                                })
                        }
                        res.redirect('/user/orderifm');
                }
        })
};
exports.orderifm=function(req,res){ //주문정보페이지
        var id=req.session.user;
        var maxpost=20; //페이지당 주문수
        var pno=req.params.pno; //페이지넘버
        if(!pno)  var pno=1;
        var start=maxpost*pno-maxpost;
        var sql="select count(*) as mbcnt from orders where id=?";
        con.query(sql,id,function(err,result){
                if(err) console.log(err);
                else{
                        var mbcnt=result[0].mbcnt;
                        var sql
                        var sql="select orders.onum,ordersdetail.optnum,ordersdetail.cnt,product.name,orders.total,orders.order_date,productimg.simgname,productopt.optprice,productopt.optname";
                        var sql=sql+" from orders,ordersdetail,product,productimg,productopt where id=? and orders.onum=ordersdetail.onum and ordersdetail.num=product.num and product.num=productimg.num and ordersdetail.optnum=productopt.optnum ORDER BY onum desc limit ?,?;";
                        console.log(sql);
                        con.query(sql,[id,start,maxpost],function(err,result){
                                if(err) console.log(err);
                                else{
                                        var pager={
                                                pagecnt:mbcnt%maxpost == 0 ? Math.trunc(mbcnt/maxpost) : Math.trunc(mbcnt/maxpost) +1, //총페이지수
                                                startpost:maxpost*pno-maxpost, //시작주문넘버
                                                endpost:maxpost*pno-1< mbcnt ?  maxpost*pno-1 : mbcnt-1  //마지막주문넘버
                                        }
                                        console.log(result);
                                        if(req.session.displayname){
                                                var dname=req.session.displayname;
                                                res.render('orderifm',{name:dname,id:req.session.user,orders:result,pager:pager,pno:pno});
                                        }else{
                                                res.render('orderifm');
                                        }
                                }
                        })
                }
        })
};