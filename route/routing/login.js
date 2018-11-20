var mysql=require('mysql');
var con=mysql.createConnection({
        host:'114.71.137.109',
        user:'root',
        password:'tmvlflt1234',
        database:'Mok2',
        charset:'utf8'
})
con.connect();
exports.loginget=function(req,res){ //로그인페이지
        res.render('login');
};
exports.loginpost=function(req,res){ //로그인
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
};
exports.logout=function(req,res){ //로그아웃
        delete req.session.displayname;
        req.session.save(function(){
                res.redirect('/');
        })
};