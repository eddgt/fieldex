const { Router } = require('express');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { stats } = require('../controllers/dashboard.controller');

const router = Router();

router.get('/stats', verifyToken, authorizeRole('ADMIN'), stats);

module.exports = router;
