import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody,
} from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { QueryApartmentDto } from './dto/query-apartment.dto';
import { CreateApartmentReservationDto } from './dto/create-apartment-reservation.dto';
import { ApartmentReservationStatus } from './schemas/apartment-reservation.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List public apartments / vacation rentals with filters' })
  findAll(@Query() query: QueryApartmentDto) {
    return this.apartmentsService.findAll(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] List all apartments including inactive' })
  findAllAdmin() {
    return this.apartmentsService.findAllAdmin();
  }

  @Get('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get apartment reservations (user or admin)' })
  findReservations(
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.apartmentsService.findReservations(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single apartment by ID' })
  findOne(@Param('id') id: string) {
    return this.apartmentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Create a new apartment/stay listing' })
  create(@Body() dto: CreateApartmentDto) {
    return this.apartmentsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update apartment listing' })
  update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
    return this.apartmentsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Toggle apartment active state' })
  toggle(@Param('id') id: string) {
    return this.apartmentsService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Delete apartment' })
  remove(@Param('id') id: string) {
    return this.apartmentsService.remove(id);
  }

  @Post(':id/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Book an apartment stay' })
  createReservation(
    @Param('id') id: string,
    @Body() dto: CreateApartmentReservationDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.apartmentsService.createReservation(id, dto, userId);
  }

  @Patch('reservations/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: '[Admin] Update apartment reservation status' })
  updateReservationStatus(
    @Param('id') id: string,
    @Body('status') status: ApartmentReservationStatus,
  ) {
    return this.apartmentsService.updateReservationStatus(id, status);
  }
}
