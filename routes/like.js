const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();
const token = require('../modules/token').verify;
const { QueryTypes, INTEGER } = require('sequelize');
const { Posts, Users, Likes, sequelize } = require('../models');
router.use(cookieParser());
router.use(express.json());

router.get('/like', async (req, res) => {
  try {
    const { nickname, userId } = token(req.cookies);
    // if (userInfo.userId !== result[0].userId) {
    //   return res
    //     .status(403)
    //     .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    // }
    // if (!userInfo) {
    //   return res.status(403).json({
    //     errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.',
    //   });
    // }
    const [result, metadata] = await sequelize.query(
      `SELECT p.postId, u.userId ,nickname, title , p.createdAt, COUNT(likeId) as 'likes'
      FROM Posts p INNER JOIN Users u 
      on p.userId = u.userId 
      LEFT JOIN Likes l 
      on p.postId = l.postId 
      WHERE u.userId = ${userId} and likeId > 0 
      GROUP by p.postId
      ORDER BY COUNT(likeId) DESC`
    );

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(400).json({ err, errorMessage: '로그인이 필요합니다.' });
  }
});

router.put('/:postId/like', async (req, res) => {
  const userInfo = token(req.cookies);
  const { userId } = userInfo;
  const { postId } = req.params;

  try {
    const [result, metadata] = await sequelize.query(
      `SELECT likeId FROM Likes l where userId = ${userId} and postId = ${postId}`
    );

    const likeA = result.length === 0 ? true : false;

    if (likeA) {
      await Likes.create({ userId, postId });
      res.status(201).json({ Message: '좋아요를 눌렀습니다.' });
      return;
    }
    if (!likeA) {
      await Likes.destroy({ where: { postId, userId } });
      res.status(201).json({ Message: '좋아요를 취소했습니다.' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ err, errorMessage: '좋아요를 실패했습니다.' });
  }
  // if (like) {
  //   res.send(200).json({ Message: '좋아요를 취소 하였습니다.' });
  // } else {
  //   res.send(200).json({ Message: '좋아요를 등록 하였습니다.' });
  // }
});

module.exports = router;