const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const { sendReport } = require('../controllers/reports.controller');

const router = Router();
router.use(verifyToken);

router.post('/:visitId/send-report', sendReport);

module.exports = router;
