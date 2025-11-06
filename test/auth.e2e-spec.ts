import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('token');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe('john@example.com');
          expect(res.body.user.name).toBe('John Doe');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return 409 if user already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        })
        .expect(201);

      // Try to register again with same email
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should return 400 if email is invalid', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 if password is too short', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'John Doe',
          email: 'john2@example.com',
          password: '12345', // Less than 6 characters
        })
        .expect(400);
    });

    it('should return 400 if name is missing', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          email: 'john3@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 if email is missing', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'John Doe',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 if password is missing', () => {
      return request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'John Doe',
          email: 'john4@example.com',
        })
        .expect(400);
    });
  });

  describe('/login (POST)', () => {
    const testUser = {
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'password123',
    };

    beforeAll(async () => {
      // Register a test user
      await request(app.getHttpServer())
        .post('/register')
        .send(testUser)
        .expect(201);
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('token');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return 401 with invalid email', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 401 with invalid password', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 if email is invalid format', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 if email is missing', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          password: testUser.password,
        })
        .expect(400);
    });

    it('should return 400 if password is missing', () => {
      return request(app.getHttpServer())
        .post('/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });
});

