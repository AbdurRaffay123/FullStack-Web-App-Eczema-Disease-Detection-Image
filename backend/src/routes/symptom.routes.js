const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptom.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateCreateLog, validateUpdateLog } = require('../validators/symptom.validator');

/**
 * Symptom Log Routes
 * Base path: /api/logs
 * All routes require authentication
 */

router.use(authenticate); // All routes require authentication

router.post('/', validateCreateLog, symptomController.createLog);
router.get('/', symptomController.getLogs);
router.get('/:id', symptomController.getLogById);
router.put('/:id', validateUpdateLog, symptomController.updateLog);
router.delete('/:id', symptomController.deleteLog);

module.exports = router;

