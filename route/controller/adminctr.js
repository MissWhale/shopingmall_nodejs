const router = require('express').Router();
const admin = require('../routing/admin');
var multer=require('multer');
var path = require('path'); var appDir = path.dirname(require.main.filename); 
var upload=multer({storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, appDir+'/dbimg/');
        },
        filename: function (req, file, cb) {
          cb(null, Date.now()+"-"+file.originalname);
        }
}),});
router.get("/member",admin.member); //회원관리페이지
router.post('/memdel',admin.memdel); //회원삭제
router.post('/memmodi',admin.memmodi); //회원정보수정
router.get("/product",admin.product);//상품관리페이지
router.post('/productdelete',admin.prodel); //상품삭제
router.get(["/productmodify",'/productmodify?:num'],admin.promodi); //상품수정페이지
router.post('/productmodify',admin.promodify); //상품수정
router.get('/productupload',admin.proupload); //상품등록페이지
router.post('/productupload',admin.prouploadpost); //상품등록
router.post('/noimg',admin.noimg); //썸네일없음
router.post("/simgdb",upload.single('simg'),admin.simgupload); //썸네일업로드
router.post('/bimgdb',upload.single('upload'),admin.bimgupload); //이미지업로드
router.post('/optadd',admin.optadd);  //옵션추가
router.post('/optmodi',admin.optmodi); //옵션수정
router.post('/optdel',admin.optdel); //옵션삭제
router.post('/getoptnum',admin.getoptnum); //Auto_increment Option Get
router.post('/getnum',admin.getnum); // Auto_increment Get
router.get("/order",admin.order); //주문관리페이지
router.get(["/orderdetail","/orderdetail?=:num"],admin.orderdetail); //주문상세페이지
router.post('/statusch',admin.statusch);//주문상태 체인지
router.post('/orderupdate',admin.orderupdate); //주문정보 수정
router.get("/faq",admin.faq);  //faq페이지
router.get('/faqupload',admin.faqupload); //faq등록페이지
router.post('/faquplaod',admin.faquploadpost); //faq등록
router.get(["/faqmodify","/faqmodify=:num"],admin.faqmodi); //faq수정페이지
router.post('/faqmodify',admin.faqmodify); //faq수정
router.post('/faqdelete',admin.faqdel); //faq삭제
module.exports = router;