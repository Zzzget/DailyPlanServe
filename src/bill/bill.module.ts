import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Bill } from './entities/bill.entity';
import { BillController } from './bill.controller';
import { BillService } from './bill.service';

@Module({
  // 引入 AuthModule 以获得 JwtAuthGuard（账单接口需要登录校验）
  imports: [TypeOrmModule.forFeature([Bill]), AuthModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [TypeOrmModule],
})
export class BillModule {}
