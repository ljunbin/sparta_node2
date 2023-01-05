const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();
const token = require('../modules/token').verify;
const { Posts, Users, Comments, sequelize } = require('../models');
const { QueryTypes, INTEGER } = require('sequelize');
router.use(cookieParser());
router.use(express.json());

router.post('/:postId', async (req, res) => {
  const { nickname, userId } = token(req.cookies);
  const { comment } = req.body;
  const { postId } = req.params;
  try {
    if (!comment) {
      return res.status(412).json({
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
    } else if (comment === '') {
      return res.status(412).json({
        errorMessage: '댓글 형식이 올바르지 않습니다.',
      });
    } else {
      const createPosts = await Comments.create({
        postId,
        userId,
        comment,
      });
      return res.status(201).json({ Message: '댓글 작성이 완료되었습니다.' });
    }
  } catch (err) {
    res.status(400).json({ err, errorMessage: '댓글 작성에 실패했습니다.' });
  }
});

/// 댓글 전체조회
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const [result, metadata] = await sequelize.query(
      `SELECT postId, commentId, u.userId, nickname, comment, createdAt FROM Comments c 
    INNER JOIN Users u 
    ON c.userId = u.userId 
    WHERE c.postId = ${postId} 
    ORDER BY createdAt DESC `
    );
    return res.status(200).json({ message: '댓글 조회 완료', result });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

/////////// 게시글 수정
router.put('/:commentId', async (req, res) => {
  const userInfo = token(req.cookies);
  const { comment } = req.body;
  const { commentId } = req.params;
  const [result, metadata] = await sequelize.query(
    `SELECT c.userId FROM Comments c
    INNER JOIN Users u
    ON c.userId = u.userId 
    AND c.commentId = ${commentId}`
  );

  try {
    if (userInfo.userId !== result[0].userId) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!userInfo) {
      return res.status(403).json({
        errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.',
      });
    }
    if (!comment) {
      return res.status(412).json({
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
    } else {
      await Comments.update({ comment }, { where: { commentId } });
      res.status(201).json({ Message: '댓글 수정이 완료되었습니다.' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ err, errorMessage: '댓글 수정에 실패했습니다.' });
  }
});

///////// 게시글 삭제
router.delete('/:commentId', async (req, res) => {
  const userInfo = token(req.cookies);
  const { commentId } = req.params;
  const [result, metadata] = await sequelize.query(
    `SELECT c.userId FROM Comments c
    INNER JOIN Users u
    ON c.userId = u.userId 
    AND c.commentId = ${commentId}`
  );
  try {
    if (userInfo.userId === result[0].userId) {
      await Comments.destroy({ where: { commentId } });
      res.status(200).json({
        Message: '댓글이 성공적으로 삭제 되었습니다.',
      });
      return;
    } else if (userInfo.userId !== result[0].userId) {
      res.status(401).json({
        errorMessage: '로그인이 필요한 기능 입니다.',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      errorMessage: '옳바르지 않은 양식입니다. (존재하지 않는 값입니다.)',
    });
    return;
  }
});
module.exports = router;