const express = require('express');
const router  = express.Router();
const { getMeetings, getMeeting, createMeeting, updateMeeting, markAttendance, addMinutes, getNextMeeting } = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get ('/next', getNextMeeting);
router.get ('/',     getMeetings);
router.get ('/:id',  getMeeting);
router.post('/',     authorize('super_admin','admin'), createMeeting);
router.put ('/:id',  authorize('super_admin','admin'), updateMeeting);
router.post('/:id/attendance', markAttendance);
router.put ('/:id/minutes',    authorize('super_admin','admin'), addMinutes);

module.exports = router;
