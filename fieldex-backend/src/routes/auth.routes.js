const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { login, refresh, logout, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Demasiados intentos. Espera 15 minutos.' },
});

const router = Router();

router.post('/login', limiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

module.exports = router;
