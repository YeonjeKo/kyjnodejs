const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증 처리

    // client cookie에서 토큰 가져오기
    let token = req.cookies.x_auth;

    // 토큰 복호화 한 후 user 찾기
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true });

        req.token = token;
        req.user = user;
        next();
    });

    // user가 있으면 인증 O
    // user가 있으면 인증 X
};

module.exports = { auth };