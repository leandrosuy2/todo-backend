import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '../config/database.config';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        ...databaseConfig(),
        models: [User, Task],
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}

