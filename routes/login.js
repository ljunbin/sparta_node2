const express = require("express");
const router = express.Router();
const token = require('../models/');
const jwt = require('jsonwebtoken');
const { User} = require('../models');

const SECRET_KEY = 'Sparta'

router.post("/", async (req, res) => {
  const { nickname, password } = req.body;
  try {
    const user = await User.findOne({where:{nickname,password}});
    const createToken = await token.sign(user);
    
    res.cookie('accessToken', createToken); // Access Token을 Cookie에 전달한다.
    res.cookie('refreshToken', createToken); // Refresh Token을 Cookie에 전달한다.

  } catch (error) {
    return res.status(400).send({errorMessage:"아이디 또는 패스워드를 확인해주세요."})    
  }

});

// Access Token을 생성합니다.
function createAccessToken(id) {
  const accessToken = jwt.sign(
    { id: id }, // JWT 데이터
    SECRET_KEY, // 비밀키
    { expiresIn: '10s' }) // Access Token이 10초 뒤에 만료되도록 설정합니다.

  return accessToken;
}

// Refresh Token을 생성합니다.
function createRefreshToken() {
  const refreshToken = jwt.sign(
    {}, // JWT 데이터
    SECRET_KEY, // 비밀키
    { expiresIn: '7d' }) // Refresh Token이 7일 뒤에 만료되도록 설정합니다.

  return refreshToken;
}

module.exports = router;

