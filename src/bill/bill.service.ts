import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Bill, BillType } from './entities/bill.entity';

/**
 * 账单服务：所有查询/写入都强制带上当前用户的 userId，
 * 从而实现「只能操作自己的账单」的数据隔离（最核心的权限控制）。
 */
@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  create(data: {
    userId: string;
    type: BillType;
    amount: number;
    category: string;
    recordDate: string;
    note?: string;
  }): Promise<Bill> {
    const bill = this.billRepository.create(data);
    return this.billRepository.save(bill);
  }

  get(data: {
    userId: string;
    type?: BillType;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Bill[]> {
    // 查询条件始终以 userId 为基准，保证不会查到别人的账单
    const where: FindOptionsWhere<Bill> = { userId: data.userId };

    if (data.type) {
      where.type = data.type;
    }
    if (data.category) {
      where.category = data.category;
    }
    // 日期范围过滤：Between(start, end)，只传一端时则退化为当天/单点查询
    if (data.startDate && data.endDate) {
      where.recordDate = Between(data.startDate, data.endDate);
    } else if (data.startDate) {
      where.recordDate = Between(data.startDate, data.startDate);
    } else if (data.endDate) {
      where.recordDate = Between(data.endDate, data.endDate);
    }

    return this.billRepository.find({ where });
  }
}
