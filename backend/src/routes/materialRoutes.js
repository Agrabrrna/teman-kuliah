const express = require('express');
const router = express.Router();
const multer = require('multer');
const materialController = require('../controllers/materialController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authMiddleware);

router.get('/', materialController.getMaterials);
router.post('/upload', upload.single('file'), materialController.uploadMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
