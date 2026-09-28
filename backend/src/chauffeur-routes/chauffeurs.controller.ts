import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChauffeurRoutesService } from './chauffeur-routes.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';

@ApiTags('Chauffeurs')
@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly routesService: ChauffeurRoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chauffeurs' })
  getAll() {
    return this.routesService.getAllChauffeurs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single chauffeur by id' })
  getOne(@Param('id') id: string) {
    return this.routesService.getChauffeurById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chauffeur (Admin)' })
  create(@Body() dto: CreateChauffeurDto) {
    return this.routesService.createChauffeur(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a chauffeur (Admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateChauffeurDto>) {
    return this.routesService.updateChauffeur(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle chauffeur active status (Admin)' })
  toggle(@Param('id') id: string) {
    return this.routesService.toggleChauffeur(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chauffeur (Admin)' })
  delete(@Param('id') id: string) {
    return this.routesService.deleteChauffeur(id);
  }
}
