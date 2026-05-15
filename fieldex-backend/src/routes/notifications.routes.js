const { Router } = require('express');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { list, resend, send } = require('../controllers/notifications.controller');

const router = Router();
router.use(verifyToken, authorizeRole('ADMIN'));

router.get('/', list);
router.post('/:id/resend', resend);
router.post('/visits/:visitId/send', send);

module.exports = router;
