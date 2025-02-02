const express = require('express');
const FAQController = require('../controllers/faqController');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get('/', cacheMiddleware, FAQController.getAllFAQs);
router.post('/', FAQController.createFAQ);
router.put('/:id', FAQController.updateFAQ);
router.delete('/:id', FAQController.deleteFAQ);

module.exports = router;
