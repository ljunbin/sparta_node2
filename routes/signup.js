const express = require('express');
const router = express.Router();
const { User } = require('../models/index.js');
const { Op } = require("sequelize");

router.post("/", async (req, res) => {
    const { nickname, password, confirm } = req.body;

    try {
        // #412 닉네임 형식이 비정상적인 경우
        const reg = /^[A-Za-z0-9]{3,12}$/;
        if (false === reg.test(nickname)){
            return res.status(412).send({
                errorMessage: "닉네임 형식이 일치하지 않습니다. 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성해주세요."
            })
        }
        // #412 닉네임이 중복된 경우
        const existsUsers = await User.findAll({
            where: {
            [Op.or]: [{ nickname }],
            },
        });
        if (existsUsers.length) {
            res.status(412).send({
            errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
            });
            return;
        }
        } catch (err) {
            return res.status(400).send({
                errorMessage: "요청한 데이터 형식이 올바르지 않습니다."
            })
        }

        // #412 password가 일치하지 않는 경우
        if (password !== confirm) {
            return res.status(412).send({
                errorMessage: "패스워드가 일치하지 않습니다.",
            });
        }
    
        // #412 password 형식이 비이상적인 경우
        if (password.length < 4) {
            return res.status(412).send({
                errorMessage: "패스워드 형식이 일치하지 않습니다. 최소 4글자 이상으로 설정해주세요."
            })
        }
    
        // #412 password에 닉네임이 포함되어 있는 경우
        if (password.search(nickname) > -1) {
            return res.status(412).send({
                errorMessage: "패스워드에 닉네임이 포함되어 있습니다."
            })
        }

        await User.create({ nickname, password });
        res.status(201).send({message: "회원가입에 성공했습니다."});
});

module.exports = router;

// 닉네임, 비밀번호, 비밀번호 확인을 **request**에서 전달받기
// 닉네임은 `최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)`로 구성하기
// 비밀번호는 `최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패`로 만들기
// 비밀번호 확인은 비밀번호와 정확하게 일치하기
// 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우 "중복된 닉네임입니다." 라는 에러메세지를 **response**에 포함하기

// function chkPW(){

// 	var pw = $("#password").val();
// 	var id = $("#id").val();
		
// 	var reg = /^ (?=.*?[A-Z]) (?=.*?[a-z]) (?=.*?[0-9]) (?=.*?[#?!@$%^&*-]) . {8,}$/;
// 	var hangulcheck = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
	 
// 	if(false === reg.test(pw)) {
// 	alert('비밀번호는 8자 이상이어야 하며, 숫자/대문자/소문자/특수문자를 모두 포함해야 합니다.');

// 	}else if(/(\w)\1\1\1/.test(pw)){
// 	 alert('같은 문자를 4번 이상 사용하실 수 없습니다.');
// 	 return false;
// 	 }else if(pw.search(id) > -1){
// 	 alert("비밀번호에 아이디가 포함되었습니다.");
// 	  return false;
// 	 }else if(pw.search(/\s/) != -1){
// 	 alert("비밀번호는 공백 없이 입력해주세요.");
// 	 return false;
// 	 }else if(hangulcheck.test(pw)){
// 	 alert("비밀번호에 한글을 사용 할 수 없습니다."); 
// 	 }else {
// 	 console.log("통과");
// 	 }

// }