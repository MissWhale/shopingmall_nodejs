var mysql=require('mysql');
var con=mysql.createConnection({
        host:'114.71.137.109',
        user:'root',
        password:'tmvlflt1234',
        database:'Mok2',
        charset:'utf8'
})
con.connect();
exports.main=function(req,res){ //상품페이지
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
                                        var sql="select product.num,avg(star) as star,count(*) as cnt from product join productreview using(num) GROUP BY 1";
                                        con.query(sql,function(err,star){
                                                if(err) console.log(err);
                                                else{
                                                        if(req.session.displayname){
                                                                var dname=req.session.displayname;
                                                                res.render('main',{name:dname,id:req.session.user,product:result,pager:pager,pno:pno,star,star});
                                                        }else{
                                                                res.render('main',{product:result,pager:pager,pno:pno,star,star});
                                                        }
                                                }
                                        })
                                }
                        })
                }
        })
};
exports.productdetail=function(req,res){ //상세정보페이지
        var pno=req.query.num;
        var sql="select product.*,productimg.*,optcode,min(optprice) as min from product join productimg using(num) join productopt using(num) where num=?";
        con.query(sql,pno,function(err,result){
                if(err) console.log(err);
                else{
                        var sql="select * from productopt where num=?";
                        con.query(sql,pno,function(err,opt){
                                if(err) console.log(err);
                                else{
                                        var sql="select * from productreview join productopt using(num) where num=? and productopt.optnum = productreview.optnum";
                                        con.query(sql,pno,function(err,review){
                                                if(err) console.log(err);
                                                else{
                                                        var sql="select avg(star) as star from productreview where num=?";
                                                        con.query(sql,pno,function(err,star){
                                                                if(err) console.log(err);
                                                                else{
                                                                        if(req.session.displayname){
                                                                                var dname=req.session.displayname;
                                                                                res.render('prodetail',{name:dname,id:req.session.user,pro:result[0],opt:opt,review:review,star:star[0].star});
                                                                        }else{
                                                                                res.render('prodetail',{pro:result[0],opt:opt,min:min[0]});
                                                                        }
                                                                }
                                                        })
                                                }
                                        })
                                }
                        })
                }
        })
};
exports.basketadd=function(req,res){ //장바구니추가
        var num=req.body.num;
        var optnum=req.body.optnum;
        var cnt=req.body.cnt;
        var id=req.session.user;
        var sql="insert into basket(num,optnum,id,cnt) values(?,?,?,?)";
        con.query(sql,[num,optnum,id,cnt],function(err,result){
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
exports.help=function(req,res){ //고객센터
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
};