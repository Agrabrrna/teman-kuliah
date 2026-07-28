const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', materialController.getMaterials);
router.post('/upload', materialController.uploadMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
