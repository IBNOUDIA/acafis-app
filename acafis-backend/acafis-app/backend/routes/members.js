const express = require('express');
const router  = express.Router();
const { getMembers, getMember, createMember, updateMember, getMemberStats } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get ('/stats', authorize('super_admin','admin','admin_finance'), getMemberStats);
router.get ('/',      authorize('super_admin','admin','admin_finance','membre_ca'), getMembers);
router.get ('/:id',   authorize('super_admin','admin','admin_finance','membre_ca'), getMember);
router.post('/',      authorize('super_admin','admin'), createMember);
router.put ('/:id',   authorize('super_admin','admin'), updateMember);

module.exports = router;
