import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BillType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/** 常用分类常量，前端可用作默认选项，实际存储为字符串支持自定义 */
export const BILL_CATEGORIES = {
  income: ['工资', '奖金', '兼职', '理财', '红包', '其他收入'],
  expense: [
    '餐饮',
    '交通',
    '购物',
    '住房',
    '娱乐',
    '医疗',
    '教育',
    '通讯',
    '其他支出',
  ],
};

@Entity('bill_records')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column({ type: 'enum', enum: BillType })
  type: BillType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50 })
  category: string;

  @Index()
  @Column({ name: 'record_date', type: 'date' })
  recordDate: string;

  @Column({ length: 200, nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
