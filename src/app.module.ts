import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillModule } from './bill/bill.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

/**
 * 根模块：负责装配全局配置与各业务模块的入口。
 */
@Module({
  imports: [
    // isGlobal=true 使 ConfigService 在所有模块可用，无需重复 import；
    // load 把 .env 解析成带默认值的配置对象（见 config/configuration.ts）
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    BillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
