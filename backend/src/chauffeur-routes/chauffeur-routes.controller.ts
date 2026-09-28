import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChauffeurRoutesService } from './chauffeur-routes.service';
import { CreateChauffeurRouteDto } from './dto/create-chauffeur-route.dto';
import { CreateChauffeurReservationDto } from './dto/create-chauffeur-reservation.dto';
import { CreateChauffeurLocationDto } from './dto/create-chauffeur-location.dto';

@ApiTags('ChauffeurRoutes')
@Controller('chauffeur-routes')
export class ChauffeurRoutesController {
  constructor(private readonly routesService: ChauffeurRoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chauffeur routes' })
  getAll() {
    return this.routesService.getAll();
  }

  // ══════════════ LOCATIONS ENDPOINTS (CRUD) ══════════════
  @Get('locations')
  @ApiOperation({ summary: 'Get active transfer locations for client selector' })
  getActiveLocations(@Query('type') type?: string) {
    return this.routesService.getActiveLocations(type);
  }

  @Get('admin/locations')
  @ApiOperation({ summary: 'Get all transfer locations for Admin CRUD' })
  getAllLocations() {
    return this.routesService.getAllLocations();
  }

  @Post('admin/locations')
  @ApiOperation({ summary: 'Create a new transfer location (Admin)' })
  createLocation(@Body() dto: CreateChauffeurLocationDto) {
    return this.routesService.createLocation(dto);
  }

  @Put('admin/locations/:id')
  @ApiOperation({ summary: 'Update a transfer location (Admin)' })
  updateLocation(@Param('id') id: string, @Body() dto: Partial<CreateChauffeurLocationDto>) {
    return this.routesService.updateLocation(id, dto);
  }

  @Delete('admin/locations/:id')
  @ApiOperation({ summary: 'Delete a transfer location (Admin)' })
  deleteLocation(@Param('id') id: string) {
    return this.routesService.deleteLocation(id);
  }

  @Patch('admin/locations/:id/toggle')
  @ApiOperation({ summary: 'Toggle location active status (Admin)' })
  toggleLocation(@Param('id') id: string) {
    return this.routesService.toggleLocation(id);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a chauffeur route exists between Point A and Point B' })
  checkRoute(@Query('from') from: string, @Query('to') to: string) {
    return this.routesService.checkRoute(from, to);
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Get chauffeur reservations' })
  getReservations(
    @Query('userId') userId?: string,
    @Query('role') role?: string,
    @Query('email') email?: string,
  ) {
    return this.routesService.getReservations({ userId, role, email });
  }

  @Patch('reservations/:id/status')
  @ApiOperation({ summary: 'Update chauffeur reservation status' })
  updateReservationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.routesService.updateReservationStatus(id, status);
  }

  @Post(':id/book')
  @ApiOperation({ summary: 'Book a chauffeur route' })
  bookRoute(
    @Param('id') routeId: string,
    @Body() dto: CreateChauffeurReservationDto,
  ) {
    return this.routesService.bookRoute(routeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single chauffeur route by id' })
  getOne(@Param('id') id: string) {
    return this.routesService.getOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chauffeur route (Admin)' })
  create(@Body() dto: CreateChauffeurRouteDto) {
    return this.routesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chauffeur route (Admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateChauffeurRouteDto>) {
    return this.routesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chauffeur route (Admin)' })
  delete(@Param('id') id: string) {
    return this.routesService.delete(id);
  }
}
