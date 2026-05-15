const prisma = require('../prisma/client');
const storageService = require('../services/storage.service');

async function listPhotos(req, res, next) {
  try {
    const photos = await prisma.photo.findMany({
      where: { visitId: req.params.visitId },
      orderBy: { timestamp: 'asc' },
    });
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No se envió archivo' });

    const { visitId } = req.params;
    const lat = req.body.lat ? parseFloat(req.body.lat) : null;
    const lng = req.body.lng ? parseFloat(req.body.lng) : null;

    const url = await storageService.upload(req.file, visitId);

    const photo = await prisma.photo.create({
      data: { visitId, url, lat, lng },
    });

    res.status(201).json({ success: true, data: photo });
  } catch (err) {
    next(err);
  }
}

async function deletePhoto(req, res, next) {
  try {
    const photo = await prisma.photo.findUniqueOrThrow({ where: { id: req.params.photoId } });
    await storageService.remove(photo.url);
    await prisma.photo.delete({ where: { id: photo.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPhotos, uploadPhoto, deletePhoto };
