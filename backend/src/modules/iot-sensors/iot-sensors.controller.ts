import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IoTSensorsService } from './iot-sensors.service';
import { CreateIoTSensorDto } from './dto/create-iot-sensor.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentTenant, TenantContext } from '../../common/decorators/current-tenant.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('iot-sensors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
export class IoTSensorsController {
  constructor(private readonly iotSensorsService: IoTSensorsService) {}

  /**
   * GET /api/v1/iot-sensors
   * List all registered IoT hardware sensors
   */
  @Get()
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.iotSensorsService.findAll(tenant);
  }

  /**
   * GET /api/v1/iot-sensors/:id
   * Retrieve sensor details and telemetry history
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.iotSensorsService.findById(id, tenant);
  }

  /**
   * POST /api/v1/iot-sensors
   * Register a new IoT hardware sensor
   */
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditLog('IOT_SENSOR_CREATED', 'IoTSensor')
  async create(
    @Body() dto: CreateIoTSensorDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.iotSensorsService.create(dto, tenant);
  }

  /**
   * PUT /api/v1/iot-sensors/:id
   * Update IoT sensor configuration
   */
  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('IOT_SENSOR_UPDATED', 'IoTSensor')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateIoTSensorDto>,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.iotSensorsService.update(id, dto, tenant);
  }

  /**
   * POST /api/v1/iot-sensors/telemetry
   * Ingest telemetry readings from IoT sensors (evaluates CCP breaches automatically)
   */
  @Post('telemetry')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('IOT_TELEMETRY_INGESTED', 'SensorTelemetry')
  async ingestTelemetry(
    @Body() dto: IngestTelemetryDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.iotSensorsService.ingestTelemetry(dto, tenant);
  }

  /**
   * DELETE /api/v1/iot-sensors/:id
   * Delete an IoT sensor
   */
  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditLog('IOT_SENSOR_DELETED', 'IoTSensor')
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.iotSensorsService.delete(id, tenant);
  }
}
