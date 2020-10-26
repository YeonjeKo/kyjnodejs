const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { User } = request("./models/User");
const { auth } = require('./middleware/auth');

//application/x-www-form0urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Conneted...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World! haha'));

app.post('/api/users/register', (req, res) => {
  //회원가입할 때 필요한 정보들을 client에서 가져오면
  //그것들을 db에 넣어준다

  const user = new User(req.body);

  user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err})
    return res.status(200).json({
      success: true
    });
  });
});

app.post('/api/users/login', (req, res) => {

  //요청된 아이디를 db에서 찾는다
  User.findOne({ email: req.body.email }, (err, userInfo) => {
    if(!userInfo) {
      return res.json({
        loginSuccess: false,
        message: "존재하지 않는 ID입니다."
      });
    }
  
    //요청된 아이디가 db에 있다면 패스워드가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "password가 틀렸습니다." })
    
      //패스워드까지 맞다면 토큰 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다 (쿠키/로컬스토리지 등 다양)
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id });
      });
    });  
  });
});

//role 1: admin   role 2: 특정 부서 admin
//role 0: 일반 user   role 0 X: 관리자
app.get('/api/users/auth', auth, (req, res) => {
  //여기까지 미들웨어 통과해 왔다는 건 Authentication = True
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));