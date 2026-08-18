import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { BillType } from '../entities/bill.entity';

export class CreateBillDto {
  @ApiProperty({ enum: BillType, description: '账单类型' })
  @IsEnum(BillType, { message: '类型必须是 income 或 expense' })
  type: BillType;

  @ApiProperty({ description: '金额' })
  @IsNumber()
  @Min(0.01, { message: '金额不能小于 0.01' })
  @Max(99999999.99, { message: '金额超出范围' })
  amount: number;

  @ApiProperty({ description: '分类' })
  @IsString()
  @Length(1, 50, { message: '分类长度需在 1~50 位之间' })
  category: string;

  @ApiProperty({ description: '记账日期，格式 YYYY-MM-DD' })
  @IsDateString({}, { message: '日期格式不正确，需为 YYYY-MM-DD' })
  recordDate: string;

  @ApiProperty({ required: false, description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: '备注不能超过 200 字' })
  note?: string;
}
