const FAQ = require('../models/faq');
const TranslationService = require('../services/translationService');
const { cacheService } = require('../middleware/cache');

class FAQController {
    static async getAllFAQs(req, res) {
        try {
            const lang = req.query.lang || 'en';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const faqs = await FAQ.find({ isActive: true })
                .skip((page - 1) * limit)
                .limit(limit);

            const translatedFaqs = await Promise.all(
                faqs.map(async (faq) => {
                    const translation = faq.getTranslation(lang);
                    if (!translation) {
                        return await TranslationService.translateFAQ(faq, lang);
                    }
                    return translation;
                })
            );

            const response = {
                data: translatedFaqs,
                page,
                limit,
                total: await FAQ.countDocuments({ isActive: true })
            };

            if (req.cacheKey) {
                await cacheService.set(req.cacheKey, response);
            }

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching FAQs' });
        }
    }

    static async createFAQ(req, res) {
        try {
            const { question, answer } = req.body;
            const faq = new FAQ({ question, answer });
            await faq.save();
            res.status(201).json(faq);
        } catch (error) {
            res.status(400).json({ error: 'Error creating FAQ' });
        }
    }

    static async updateFAQ(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const faq = await FAQ.findByIdAndUpdate(id, updates, { new: true });
            if (!faq) {
                return res.status(404).json({ error: 'FAQ not found' });
            }
            res.json(faq);
        } catch (error) {
            res.status(400).json({ error: 'Error updating FAQ' });
        }
    }

    static async deleteFAQ(req, res) {
        try {
            const { id } = req.params;
            const faq = await FAQ.findByIdAndUpdate(id, { isActive: false }, { new: true });
            if (!faq) {
                return res.status(404).json({ error: 'FAQ not found' });
            }
            res.json({ message: 'FAQ deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: 'Error deleting FAQ' });
        }
    }
}

module.exports = FAQController;
