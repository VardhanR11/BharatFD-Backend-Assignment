const request = require('supertest');
const app = require('../src/index');
const FAQ = require('../src/models/faq');

describe('FAQ API', () => {
    beforeEach(async () => {
        await FAQ.deleteMany({});
    });

    describe('GET /api/faqs', () => {
        it('should return empty array when no FAQs exist', async () => {
            const res = await request(app).get('/api/faqs');
            expect(res.status).toBe(200);
            expect(res.body.data).toEqual([]);
        });

        it('should return FAQs with pagination', async () => {
            const faq = new FAQ({
                question: 'Test question?',
                answer: 'Test answer'
            });
            await faq.save();

            const res = await request(app).get('/api/faqs');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(10);
            expect(res.body.total).toBe(1);
        });
    });

    describe('POST /api/faqs', () => {
        it('should create a new FAQ', async () => {
            const faqData = {
                question: 'Test question?',
                answer: 'Test answer'
            };

            const res = await request(app)
                .post('/api/faqs')
                .send(faqData);

            expect(res.status).toBe(201);
            expect(res.body.question).toBe(faqData.question);
            expect(res.body.answer).toBe(faqData.answer);
        });

        it('should fail to create FAQ without required fields', async () => {
            const res = await request(app)
                .post('/api/faqs')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/faqs/:id', () => {
        it('should update an existing FAQ', async () => {
            const faq = new FAQ({
                question: 'Original question?',
                answer: 'Original answer'
            });
            await faq.save();

            const updates = {
                question: 'Updated question?',
                answer: 'Updated answer'
            };

            const res = await request(app)
                .put(`/api/faqs/${faq._id}`)
                .send(updates);

            expect(res.status).toBe(200);
            expect(res.body.question).toBe(updates.question);
            expect(res.body.answer).toBe(updates.answer);
        });
    });

    describe('DELETE /api/faqs/:id', () => {
        it('should soft delete an FAQ', async () => {
            const faq = new FAQ({
                question: 'Test question?',
                answer: 'Test answer'
            });
            await faq.save();

            const res = await request(app)
                .delete(`/api/faqs/${faq._id}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('FAQ deleted successfully');

            const deletedFaq = await FAQ.findById(faq._id);
            expect(deletedFaq.isActive).toBe(false);
        });
    });
});
