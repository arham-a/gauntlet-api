import express from 'express';
import {
  getMyJoinComp,
  getMyCreatedComp,
  addToMyCreatedComp,
  addToMyJoinComp,
  getUserStats,
} from '../controllers/user/UserDetail.js';

const router = express.Router();

// Route for getting myJoinComp
router.get('/:userId/myJoinComp', getMyJoinComp);

// Route for getting myCreatedComp
router.get('/:userId/myCreatedComp', getMyCreatedComp);

// Route for getting user stats
router.get('/:userId/stats', getUserStats);

// Route for adding comp ID to myCreatedComp
router.post('/:userId/:compId/myCreatedComp', addToMyCreatedComp);

// Route for adding comp ID to myJoinComp
router.post('/:userId/:compId/myJoinComp', addToMyJoinComp);

export default router;
