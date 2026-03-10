const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');
const { Admin, Blog } = require('../models');

let mongoServer;
let accessToken;
let testBlog;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Blog API', () => {
  beforeEach(async () => {
    // Create admin
    const admin = await Admin.create({
      email: 'test@growthvalley.com',
      password: 'TestPassword123!',
      name: 'Test Admin',
      role: 'admin',
    });

    // Login
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'test@growthvalley.com',
        password: 'TestPassword123!',
      });
    accessToken = res.body.data.accessToken;

    // Create test blog
    testBlog = await Blog.create({
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      content: 'Full content',
      category: 'Technology',
      status: 'published',
      author: admin._id,
      publishDate: new Date(),
    });
  });

  describe('GET /api/blog', () => {
    it('should return published blog posts', async () => {
      const res = await request(app).get('/api/blog');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/blog/admin/:id', () => {
    it('should return blog by ID (Bug 1 fix test)', async () => {
      const res = await request(app)
        .get(`/api/blog/admin/${testBlog._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Test Blog Post');
    });
  });

  describe('POST /api/blog', () => {
    it('should create a new blog post', async () => {
      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'New Post',
          slug: 'new-post',
          content: 'Content',
          category: 'Strategy',
          status: 'draft',
        });

      expect(res.status).toBe(201);
    });
  });
});