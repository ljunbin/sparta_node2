const express = require('express');
const loginRouter = require('./login');
const signupRouter = require('./signup');
const commentRouter = require('./comment');
const likeRouter = require('./like');
const postRouter = require('./post');
const router = express.Router();

router.use('/login', loginRouter); 
router.use('/signup', signupRouter); 
router.use('/comment', commentRouter); 
router.use('/post', likeRouter); 
router.use('/like', postRouter); 
module.exports = router;