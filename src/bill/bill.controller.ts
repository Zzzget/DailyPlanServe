import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';

@ApiTags('bills')
@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  // 账单接口均需登录；userId 取自 token（@CurrentUser），而非前端传参
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBillDto) {
    return this.billService.create({
      ...dto,
      userId: user.id,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('get')
  find(@CurrentUser() user: AuthenticatedUser, @Query() dto: QueryBillDto) {
    return this.billService.get({
      userId: user.id,
      type: dto.type,
      category: dto.category,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
  }
}
