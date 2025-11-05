import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../models/task.model';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation', description: 'Task title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiPropertyOptional({ example: 'Write detailed documentation for the API', description: 'Task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Complete project documentation', description: 'Task title' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiPropertyOptional({ example: 'Write detailed documentation for the API', description: 'Task description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({ example: 'completed', enum: TaskStatus, description: 'Task status' })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be either "pending" or "completed"' })
  status?: TaskStatus;
}

export class QueryTasksDto {
  @ApiPropertyOptional({ example: 'pending', enum: TaskStatus, description: 'Filter tasks by status' })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be either "pending" or "completed"' })
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be at most 100' })
  limit?: number = 10;
}

