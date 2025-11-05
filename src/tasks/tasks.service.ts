import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskStatus } from '../models/task.model';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
  ) {}

  async create(userId: number, createTaskDto: CreateTaskDto) {
    const task = await this.taskModel.create({
      ...createTaskDto,
      userId,
      status: TaskStatus.PENDING,
    });

    return task;
  }

  async findAll(userId: number, queryDto: QueryTasksDto) {
    const { status, page = 1, limit = 10 } = queryDto;
    const offset = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const { rows, count } = await this.taskModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      tasks: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskModel.findOne({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id, userId);

    await task.update(updateTaskDto);

    return task;
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);

    await task.destroy();

    return { message: 'Task deleted successfully' };
  }

  async markAsCompleted(id: number, userId: number) {
    return this.update(id, userId, { status: TaskStatus.COMPLETED });
  }
}

