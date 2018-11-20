const router = require('express').Router();
const login = require('../routing/login');
const register=require('../routing/register');

router.get('/', login.loginget); //로그인페이지
router.post('/', login.loginpost); //로그인
router.get('/logout', login.logout); //로그아웃

router.get('/register',register.regiget);  //회원가입페이지
router.post('/register',register.regipost); //회원가입
router.post('/idcheck',register.idcheck); //아이디중복확인
router.post('/emailcheck',register.emailcheck); //이메일중복확인
module.exports = router;