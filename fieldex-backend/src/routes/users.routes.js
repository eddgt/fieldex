const { Router } = require('express');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { list, create, update } = require('../controllers/users.controller');

const router = Router();
router.use(verifyToken, authorizeRole('ADMIN'));

router.get('/', list);
router.post('/', create);
router.put('/:id', update);

module.exports = router;
