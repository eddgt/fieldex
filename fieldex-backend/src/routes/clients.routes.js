const { Router } = require('express');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const {
  list, create, update, remove, detail,
} = require('../controllers/clients.controller');

const router = Router();
router.use(verifyToken);

router.get('/', list);
router.get('/:id', detail);
router.post('/', authorizeRole('ADMIN'), create);
router.put('/:id', authorizeRole('ADMIN'), update);
router.delete('/:id', authorizeRole('ADMIN'), remove);

module.exports = router;
