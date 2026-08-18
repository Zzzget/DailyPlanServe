import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Bill, BillType } from './entities/bill.entity';

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
    const where: FindOptionsWhere<Bill> = { userId: data.userId };

    if (data.type) {
      where.type = data.type;
    }
    if (data.category) {
      where.category = data.category;
    }
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
