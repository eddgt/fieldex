const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  list, create, detail, updateStatus, update,
} = require('../controllers/visits.controller');

const router = Router();
router.use(verifyToken);

router.get('/', list);
router.post('/', create);
router.get('/:id', detail);
router.put('/:id', update);
router.patch('/:id/status', updateStatus);

module.exports = router;
