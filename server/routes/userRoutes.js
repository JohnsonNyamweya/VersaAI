import express from 'express';
import { getUserCreations, getPublishedCreations, toggleLikeCreation } from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.get('/creations', auth, getUserCreations);
userRouter.get('/published-creations', auth, getPublishedCreations);
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation);

export default userRouter;