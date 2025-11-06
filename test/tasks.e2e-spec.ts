import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppModule } from '../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let authToken2: string; // For second user to test isolation

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

    // Register and login first user
    const registerResponse = await request(app.getHttpServer())
      .post('/register')
      .send({
        name: 'Task User',
        email: 'taskuser@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Register and login second user for isolation tests
    const registerResponse2 = await request(app.getHttpServer())
      .post('/register')
      .send({
        name: 'Task User 2',
        email: 'taskuser2@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken2 = registerResponse2.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a task successfully', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          expect(res.body.description).toBe('Test Description');
          expect(res.body.status).toBe('pending');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should create a task without description', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task Without Description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('Task Without Description');
          expect(res.body.description).toBeNull();
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
        })
        .expect(401);
    });

    it('should return 400 if title is missing', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Description',
        })
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    let taskId1: number;
    let taskId2: number;
    let taskId3: number;

    beforeAll(async () => {
      // Create some tasks for testing
      const task1 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Pending Task',
          description: 'This is pending',
        })
        .expect(201);
      taskId1 = task1.body.id;

      const task2 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Completed Task',
          description: 'This is completed',
        })
        .expect(201);
      taskId2 = task2.body.id;

      // Mark task2 as completed
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId2}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Create another task
      const task3 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Another Pending Task',
        })
        .expect(201);
      taskId3 = task3.body.id;
    });

    it('should return all tasks for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.tasks)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');
        });
    });

    it('should filter tasks by pending status', () => {
      return request(app.getHttpServer())
        .get('/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.tasks).toBeInstanceOf(Array);
          res.body.tasks.forEach((task: any) => {
            expect(task.status).toBe('pending');
          });
        });
    });

    it('should filter tasks by completed status', () => {
      return request(app.getHttpServer())
        .get('/tasks?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.tasks).toBeInstanceOf(Array);
          res.body.tasks.forEach((task: any) => {
            expect(task.status).toBe('completed');
          });
        });
    });

    it('should paginate tasks correctly', () => {
      return request(app.getHttpServer())
        .get('/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(2);
          expect(res.body.tasks.length).toBeLessThanOrEqual(2);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/tasks').expect(401);
    });

    it('should only return tasks from the authenticated user', async () => {
      // Create a task with user 2
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          title: 'User 2 Task',
        })
        .expect(201);

      // Get tasks for user 1 - should not see user 2's task
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.tasks.forEach((task: any) => {
        expect(task.userId).toBe(userId);
      });
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Get Task Test',
          description: 'Test Description',
        })
        .expect(201);
      taskId = response.body.id;
    });

    it('should return a task by id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
          expect(res.body.title).toBe('Get Task Test');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should return 404 if task does not exist', () => {
      return request(app.getHttpServer())
        .get('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(401);
    });

    it('should return 404 if task belongs to another user', async () => {
      // Create task with user 2
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          title: 'User 2 Private Task',
        })
        .expect(201);

      const user2TaskId = response.body.id;

      // Try to access with user 1 token
      return request(app.getHttpServer())
        .get(`/tasks/${user2TaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update Task Test',
          description: 'Original Description',
        })
        .expect(201);
      taskId = response.body.id;
    });

    it('should update a task successfully', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'completed',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.description).toBe('Updated Description');
          expect(res.body.status).toBe('completed');
        });
    });

    it('should update only title', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Only Title Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Only Title Updated');
        });
    });

    it('should return 404 if task does not exist', () => {
      return request(app.getHttpServer())
        .put('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Updated Title',
        })
        .expect(401);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    let taskId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Task Test',
        })
        .expect(201);
      taskId = response.body.id;
    });

    it('should mark a task as completed', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body.id).toBe(taskId);
        });
    });

    it('should return 404 if task does not exist', () => {
      return request(app.getHttpServer())
        .patch('/tasks/99999/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .expect(401);
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Task Test',
        })
        .expect(201);
      taskId = response.body.id;
    });

    it('should delete a task successfully', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Task deleted successfully');
        });
    });

    it('should return 404 if task does not exist', () => {
      return request(app.getHttpServer())
        .delete('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(401);
    });

    it('should verify task is deleted', async () => {
      // Delete task
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to get deleted task
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

