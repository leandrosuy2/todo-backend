import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from '../models/task.model';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: typeof Task;

  const mockTaskModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<typeof Task>(getModelToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const userId = 1;
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      const mockTask = {
        id: 1,
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.PENDING,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskModel.create.mockResolvedValue(mockTask as any);

      const result = await service.create(userId, createTaskDto);

      expect(mockTaskModel.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId,
        status: TaskStatus.PENDING,
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task without description', async () => {
      const userId = 1;
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
      };

      const mockTask = {
        id: 1,
        title: createTaskDto.title,
        description: null,
        status: TaskStatus.PENDING,
        userId,
      };

      mockTaskModel.create.mockResolvedValue(mockTask as any);

      const result = await service.create(userId, createTaskDto);

      expect(mockTaskModel.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId,
        status: TaskStatus.PENDING,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    const userId = 1;

    it('should return all tasks with pagination', async () => {
      const queryDto: QueryTasksDto = {
        page: 1,
        limit: 10,
      };

      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          userId,
          status: TaskStatus.PENDING,
        },
        {
          id: 2,
          title: 'Task 2',
          userId,
          status: TaskStatus.COMPLETED,
        },
      ];

      mockTaskModel.findAndCountAll.mockResolvedValue({
        rows: mockTasks,
        count: 2,
      } as any);

      const result = await service.findAll(userId, queryDto);

      expect(mockTaskModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual({
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should filter tasks by status', async () => {
      const queryDto: QueryTasksDto = {
        status: TaskStatus.PENDING,
        page: 1,
        limit: 10,
      };

      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          userId,
          status: TaskStatus.PENDING,
        },
      ];

      mockTaskModel.findAndCountAll.mockResolvedValue({
        rows: mockTasks,
        count: 1,
      } as any);

      const result = await service.findAll(userId, queryDto);

      expect(mockTaskModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId, status: TaskStatus.PENDING },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
      expect(result.tasks).toEqual(mockTasks);
    });

    it('should handle pagination correctly', async () => {
      const queryDto: QueryTasksDto = {
        page: 2,
        limit: 5,
      };

      mockTaskModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 15,
      } as any);

      const result = await service.findAll(userId, queryDto);

      expect(mockTaskModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId },
        limit: 5,
        offset: 5,
        order: [['createdAt', 'DESC']],
      });
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should use default pagination values', async () => {
      const queryDto: QueryTasksDto = {};

      mockTaskModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      } as any);

      await service.findAll(userId, queryDto);

      expect(mockTaskModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
    });
  });

  describe('findOne', () => {
    const userId = 1;
    const taskId = 1;

    it('should return a task if found', async () => {
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        userId,
      };

      mockTaskModel.findOne.mockResolvedValue(mockTask as any);

      const result = await service.findOne(taskId, userId);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(taskId, userId)).rejects.toThrow(
        'Task not found',
      );

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
    });
  });

  describe('update', () => {
    const userId = 1;
    const taskId = 1;

    it('should update a task successfully', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: TaskStatus.COMPLETED,
      };

      const mockTask: any = {
        id: taskId,
        title: 'Old Title',
        userId,
        update: jest.fn().mockImplementation(async (data) => {
          // Update the task object with new data (like Sequelize does)
          Object.assign(mockTask, data);
          return mockTask;
        }),
      };

      mockTaskModel.findOne.mockResolvedValue(mockTask);

      const result = await service.update(taskId, userId, updateTaskDto);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockTask.update).toHaveBeenCalledWith(updateTaskDto);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('should throw NotFoundException if task not found', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      mockTaskModel.findOne.mockResolvedValue(null);

      await expect(
        service.update(taskId, userId, updateTaskDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const userId = 1;
    const taskId = 1;

    it('should delete a task successfully', async () => {
      const mockTask = {
        id: taskId,
        userId,
        destroy: jest.fn().mockResolvedValue(true),
      };

      mockTaskModel.findOne.mockResolvedValue(mockTask as any);

      const result = await service.remove(taskId, userId);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockTask.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsCompleted', () => {
    const userId = 1;
    const taskId = 1;

    it('should mark a task as completed', async () => {
      const mockTask: any = {
        id: taskId,
        userId,
        status: TaskStatus.PENDING,
        title: 'Test Task',
        update: jest.fn().mockImplementation(async (data) => {
          // Update the task object with new data (like Sequelize does)
          Object.assign(mockTask, data);
          return mockTask;
        }),
      };

      mockTaskModel.findOne.mockResolvedValue(mockTask);

      const result = await service.markAsCompleted(taskId, userId);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockTask.update).toHaveBeenCalledWith({
        status: TaskStatus.COMPLETED,
      });
      expect(result.status).toBe(TaskStatus.COMPLETED);
      expect(result.id).toBe(taskId);
    });
  });
});

