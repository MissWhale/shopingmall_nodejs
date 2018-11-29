const router = require('express').Router();
const main = require('../routing/main');
router.get(['/','/pagenum=:pno'],main.main); //메인페이지
router.get(['/productDetail','/productDetail?num=:pno'], main.productdetail); //상품상세페이지
router.post('/basketadd',main.basketadd); //장바구니추가
router.get(['/help','/help=:pno'],main.help); //faq페이지
router.get('/search',main.search); //검색
module.exports = router;