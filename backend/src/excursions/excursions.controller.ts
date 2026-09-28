import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Patch,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { QueryExcursionDto } from './dto/query-excursion.dto';
import { CreateExcursionReservationDto } from './dto/create-excursion-reservation.dto';
import { ExcursionReservationStatus } from './schemas/excursion-reservation.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Excursions')
@Controller('excursions')
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @Get()
  @ApiOperation({ summary: 'List public excursions / field trips with filters' })
  findAll(@Query() query: QueryExcursionDto) {
    return this.excursionsService.findAll(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] List all excursions including inactive' })
  findAllAdmin() {
    return this.excursionsService.findAllAdmin();
  }

  @Get('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get excursion reservations (user or admin)' })
  findReservations(
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.excursionsService.findReservations(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single excursion by ID' })
  findOne(@Param('id') id: string) {
    return this.excursionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Create a new excursion' })
  create(@Body() dto: CreateExcursionDto) {
    return this.excursionsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update excursion' })
  update(@Param('id') id: string, @Body() dto: UpdateExcursionDto) {
    return this.excursionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Delete excursion' })
  remove(@Param('id') id: string) {
    return this.excursionsService.remove(id);
  }

  @Post(':id/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Book an excursion / field trip' })
  createReservation(
    @Param('id') id: string,
    @Body() dto: CreateExcursionReservationDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.excursionsService.createReservation(id, dto, userId);
  }

  @Patch('reservations/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update excursion reservation status' })
  updateReservationStatus(
    @Param('id') id: string,
    @Body('status') status: ExcursionReservationStatus,
  ) {
    return this.excursionsService.updateReservationStatus(id, status);
  }
}
