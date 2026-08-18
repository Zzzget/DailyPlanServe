import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BillType } from '../entities/bill.entity';

export class QueryBillDto {
  @ApiProperty({ required: false, enum: BillType, description: '账单类型' })
  @IsOptional()
  @IsEnum(BillType, { message: '类型必须是 income 或 expense' })
  type?: BillType;

  @ApiProperty({ required: false, description: '分类' })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '分类长度需在 1~50 位之间' })
  category?: string;

  @ApiProperty({ required: false, description: '开始日期，格式 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确，需为 YYYY-MM-DD' })
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期，格式 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确，需为 YYYY-MM-DD' })
  endDate?: string;
}
