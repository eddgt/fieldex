const { Router } = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { listPhotos, uploadPhoto, deletePhoto } = require('../controllers/photos.controller');

const router = Router();
router.use(verifyToken);

router.get('/:visitId/photos', listPhotos);
router.post('/:visitId/photos', upload.single('photo'), uploadPhoto);
router.delete('/:visitId/photos/:photoId', deletePhoto);

module.exports = router;
