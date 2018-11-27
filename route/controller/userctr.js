const router = require('express').Router();
const user = require('../routing/user');
router.get('/information', user.information); //회원정보페이지
router.get('/basket', user.basket);  //장바구니페이지
router.post('/basdel', user.basdel); //장바구니삭제
router.post('/passchange',user.passchange); //비밀번호수정
router.get('/payment',user.paymentget);  //주문/결제페이지
router.post('/payment',user.paymentpost);  //장바구니페이지->주문페이지
router.post('/orderadd',user.orderadd); //주문정보삽입
router.get('/orderinfo',user.orderinfo); //주문상세페이지
router.post('/orderupdate',user.orderupdate); //주문정보수정
router.get(['/orderifm','/orderifm=:pno'],user.orderifm); //주문정보페이지
router.post('/buyconfirm',user.buyconfirm); //구매확정
router.get('/review',user.review); //리뷰작성페이지
router.post("/review",user.reviewpost); //리뷰작성
module.exports = router;