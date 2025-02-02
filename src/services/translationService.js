const { translate } = require('google-translate-api-x');

class TranslationService {
    static async translateText(text, targetLang) {
        try {
            const result = await translate(text, { to: targetLang });
            return result.text;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback to original text
        }
    }

    static async translateFAQ(faq, targetLang) {
        if (targetLang === 'en') return faq;

        try {
            const [translatedQuestion, translatedAnswer] = await Promise.all([
                this.translateText(faq.question, targetLang),
                this.translateText(faq.answer, targetLang)
            ]);

            return {
                question: translatedQuestion,
                answer: translatedAnswer
            };
        } catch (error) {
            console.error('FAQ translation error:', error);
            return {
                question: faq.question,
                answer: faq.answer
            };
        }
    }
}

module.exports = TranslationService;
