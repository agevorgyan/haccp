import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTSensor, SensorStatus } from './entities/iot-sensor.entity';
import { SensorTelemetry } from './entities/sensor-telemetry.entity';
import { CreateIoTSensorDto } from './dto/create-iot-sensor.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { CcpsService } from '../ccps/ccps.service';
import { ViolationsService } from '../violations/violations.service';
import { ViolationSeverity } from '../violations/entities/violation.entity';
import { TenantContext } from '../../common/decorators/current-tenant.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class IoTSensorsService {
  constructor(
    @InjectRepository(IoTSensor)
    private readonly sensorRepository: Repository<IoTSensor>,
    @InjectRepository(SensorTelemetry)
    private readonly telemetryRepository: Repository<SensorTelemetry>,
    private readonly ccpsService: CcpsService,
    private readonly violationsService: ViolationsService,
  ) {}

  /**
   * Retrieve all IoT sensors for tenant organization
   */
  async findAll(tenant: TenantContext): Promise<IoTSensor[]> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;

    if (tenant.organizationId && !isSuperAdmin) {
      return this.sensorRepository.find({
        where: { organizationId: tenant.organizationId },
        relations: ['ccp'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.sensorRepository.find({
      relations: ['ccp'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find specific sensor by ID
   */
  async findById(id: string, tenant: TenantContext): Promise<IoTSensor> {
    const isSuperAdmin = tenant.role === UserRole.SUPER_ADMIN;
    const whereCondition: any = { id };

    if (tenant.organizationId && !isSuperAdmin) {
      whereCondition.organizationId = tenant.organizationId;
    }

    const sensor = await this.sensorRepository.findOne({
      where: whereCondition,
      relations: ['ccp', 'telemetryReadings'],
    });

    if (!sensor) {
      throw new NotFoundException(`IoT Sensor with ID "${id}" not found or unauthorized.`);
    }

    return sensor;
  }

  /**
   * Register new IoT sensor node
   */
  async create(dto: CreateIoTSensorDto, tenant: TenantContext): Promise<IoTSensor> {
    if (dto.ccpId) {
      await this.ccpsService.findById(dto.ccpId, tenant);
    }

    const sensor = this.sensorRepository.create({
      ...dto,
      organizationId: tenant.organizationId,
      branchId: dto.branchId || tenant.branchId,
      status: dto.status || SensorStatus.ACTIVE,
      batteryLevel: dto.batteryLevel ?? 100,
    });

    return this.sensorRepository.save(sensor);
  }

  /**
   * Update existing sensor configuration
   */
  async update(id: string, dto: Partial<CreateIoTSensorDto>, tenant: TenantContext): Promise<IoTSensor> {
    const sensor = await this.findById(id, tenant);

    if (dto.ccpId && dto.ccpId !== sensor.ccpId) {
      await this.ccpsService.findById(dto.ccpId, tenant);
    }

    Object.assign(sensor, dto);
    return this.sensorRepository.save(sensor);
  }

  /**
   * Telemetry Ingestion Engine with Automated CCP Limit Violation Automation
   */
  async ingestTelemetry(dto: IngestTelemetryDto, tenant: TenantContext): Promise<{ telemetry: SensorTelemetry; violationTriggered?: any }> {
    const sensor = await this.findById(dto.sensorId, tenant);

    // Update sensor health metrics
    sensor.lastPingAt = new Date();
    sensor.status = SensorStatus.ACTIVE;
    if (dto.batteryLevel !== undefined) {
      sensor.batteryLevel = dto.batteryLevel;
    }
    await this.sensorRepository.save(sensor);

    // Save telemetry entry
    const telemetry = this.telemetryRepository.create({
      organizationId: tenant.organizationId,
      sensorId: sensor.id,
      value: dto.value,
      unit: dto.unit,
      timestamp: new Date(),
    });
    const savedTelemetry = await this.telemetryRepository.save(telemetry);

    let violationTriggered = null;

    // Check CCP Limits Automation
    if (sensor.ccpId) {
      try {
        const ccp = await this.ccpsService.findById(sensor.ccpId, tenant);
        const val = Number(dto.value);

        // Check Critical Limits Breach (CRITICAL severity)
        const minBreach = ccp.criticalLimitMin !== null && ccp.criticalLimitMin !== undefined && val < Number(ccp.criticalLimitMin);
        const maxBreach = ccp.criticalLimitMax !== null && ccp.criticalLimitMax !== undefined && val > Number(ccp.criticalLimitMax);

        if (minBreach || maxBreach) {
          violationTriggered = await this.violationsService.create(
            {
              sourceType: 'SENSOR',
              sourceId: savedTelemetry.id,
              severity: ViolationSeverity.CRITICAL,
              rule: `IoT Sensor "${sensor.name}" (${sensor.sensorCode}) breached critical CCP limits!`,
              actualValue: `${val} ${dto.unit}`,
              expectedValue: `Min: ${ccp.criticalLimitMin ?? 'N/A'}, Max: ${ccp.criticalLimitMax ?? 'N/A'} ${ccp.unit}`,
              branchId: sensor.branchId || tenant.branchId,
            },
            tenant,
          );
        } else {
          // Check Warning Limits Breach (MEDIUM severity)
          const warnMinBreach = ccp.warningLimitMin !== null && ccp.warningLimitMin !== undefined && val < Number(ccp.warningLimitMin);
          const warnMaxBreach = ccp.warningLimitMax !== null && ccp.warningLimitMax !== undefined && val > Number(ccp.warningLimitMax);

          if (warnMinBreach || warnMaxBreach) {
            violationTriggered = await this.violationsService.create(
              {
                sourceType: 'SENSOR',
                sourceId: savedTelemetry.id,
                severity: ViolationSeverity.MEDIUM,
                rule: `IoT Sensor "${sensor.name}" (${sensor.sensorCode}) breached warning limits`,
                actualValue: `${val} ${dto.unit}`,
                expectedValue: `Min: ${ccp.warningLimitMin ?? 'N/A'}, Max: ${ccp.warningLimitMax ?? 'N/A'} ${ccp.unit}`,
                branchId: sensor.branchId || tenant.branchId,
              },
              tenant,
            );
          }
        }
      } catch (err) {
        // CCP lookup failure warning
      }
    }

    return { telemetry: savedTelemetry, violationTriggered };
  }

  /**
   * Delete sensor node
   */
  async delete(id: string, tenant: TenantContext): Promise<{ success: boolean; id: string }> {
    const sensor = await this.findById(id, tenant);
    await this.sensorRepository.remove(sensor);
    return { success: true, id };
  }
}
