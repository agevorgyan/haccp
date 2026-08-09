import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  iotApi,
  SensorType,
  SensorStatus,
} from '../../services/iotApi';
import type { IoTSensor } from '../../services/iotApi';
import { haccpApi } from '../../services/haccpApi';
import type { Ccp } from '../../services/haccpApi';
import {
  Cpu,
  Plus,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Wifi,
  WifiOff,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const IoTMonitoringPage: FC = () => {
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [ccps, setCcps] = useState<Ccp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Simulator
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [simulatingSensor, setSimulatingSensor] = useState<IoTSensor | null>(null);
  const [simValue, setSimValue] = useState<number>(-18.5);
  const [simBattery, setSimBattery] = useState<number>(95);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Sensor Form
  const [sensorForm, setSensorForm] = useState({
    sensorCode: `SENSOR-W${Math.floor(100 + Math.random() * 900)}`,
    name: 'Walk-In Freezer Main Sensor',
    type: SensorType.TEMPERATURE as SensorType,
    ccpId: '',
    batteryLevel: 100,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedSensors, fetchedCcps] = await Promise.all([
        iotApi.getSensors(),
        haccpApi.getCcps(),
      ]);
      setSensors(fetchedSensors);
      setCcps(fetchedCcps);
      if (fetchedCcps.length > 0 && !sensorForm.ccpId) {
        setSensorForm((prev) => ({ ...prev, ccpId: fetchedCcps[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load IoT sensors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSensor = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await iotApi.createSensor(sensorForm);
      setIsSensorModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create sensor');
    }
  };

  const handleIngestSimulatedTelemetry = async (e: FormEvent) => {
    e.preventDefault();
    if (!simulatingSensor) return;

    try {
      const res = await iotApi.ingestTelemetry({
        sensorId: simulatingSensor.id,
        value: simValue,
        unit: simulatingSensor.type === SensorType.TEMPERATURE ? '°C' : '%RH',
        batteryLevel: simBattery,
      });

      setSimulationResult(res);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to ingest telemetry');
    }
  };

  const handleDeleteSensor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IoT sensor node?')) return;
    try {
      await iotApi.deleteSensor(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete sensor');
    }
  };

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case SensorStatus.ACTIVE:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case SensorStatus.OFFLINE:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case SensorStatus.MAINTENANCE:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level <= 20) return <BatteryWarning className="w-4 h-4 text-red-400" />;
    if (level <= 50) return <Battery className="w-4 h-4 text-amber-400" />;
    return <BatteryCharging className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">IoT Sensors & Real-Time Telemetry</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated sensor telemetry ingestion engine with real-time CCP breach violation detection.
          </p>
        </div>
        <button
          onClick={() => setIsSensorModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Deploy IoT Sensor Node
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Sensor Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Hardware Sensor Network Nodes ({sensors.length})
        </h2>

        {loading ? (
          <div className="text-xs text-slate-500 p-8 text-center">Loading IoT sensors...</div>
        ) : sensors.length === 0 ? (
          <div className="bg-slate-950 p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No IoT hardware nodes deployed. Click "Deploy IoT Sensor Node" to register telemetry sensors.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sensors.map((s) => (
              <div
                key={s.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700/80 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {s.type === SensorType.TEMPERATURE ? (
                      <Thermometer className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Droplets className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">{s.sensorCode}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      s.status,
                    )}`}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Live Value Indicator */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Real-Time Reading</span>
                    <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1">
                      <span>
                        {s.telemetryReadings && s.telemetryReadings.length > 0
                          ? s.telemetryReadings[0].value
                          : s.type === SensorType.TEMPERATURE
                          ? '-18.2'
                          : '45'}
                      </span>
                      <span className="text-xs text-cyan-400">
                        {s.type === SensorType.TEMPERATURE ? '°C' : '%RH'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-300">
                      {getBatteryIcon(s.batteryLevel)}
                      <span>{s.batteryLevel}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      {s.status === SensorStatus.ACTIVE ? (
                        <Wifi className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-red-400" />
                      )}
                      <span>
                        {s.lastPingAt ? new Date(s.lastPingAt).toLocaleTimeString() : 'No ping'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked CCP Threshold Limits */}
                <div className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Linked CCP:</span>
                    <span className="text-emerald-400 font-bold">{s.ccp?.code || 'None'}</span>
                  </div>
                  {s.ccp && (
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span>Crit Min: {s.ccp.criticalLimitMin ?? 'N/A'} {s.ccp.unit}</span>
                      <span>Crit Max: {s.ccp.criticalLimitMax ?? 'N/A'} {s.ccp.unit}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleDeleteSensor(s.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSimulatingSensor(s);
                      setSimValue(s.type === SensorType.TEMPERATURE ? -18.5 : 50);
                      setSimBattery(s.batteryLevel);
                      setSimulationResult(null);
                    }}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Ingest Reading / Test Breach
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEPLOY SENSOR MODAL */}
      {isSensorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Deploy Hardware Sensor Node</h3>
            <form onSubmit={handleCreateSensor} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sensor Code (Unique Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="SENSOR-WALKIN-01"
                  value={sensorForm.sensorCode}
                  onChange={(e) => setSensorForm({ ...sensorForm, sensorCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sensor Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="Walk-In Freezer Compressor Sensor"
                  value={sensorForm.name}
                  onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Sensor Type</label>
                  <select
                    value={sensorForm.type}
                    onChange={(e) => setSensorForm({ ...sensorForm, type: e.target.value as SensorType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={SensorType.TEMPERATURE}>TEMPERATURE (°C)</option>
                    <option value={SensorType.HUMIDITY}>HUMIDITY (%RH)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Linked CCP (Critical Control Point)</label>
                  <select
                    value={sensorForm.ccpId}
                    onChange={(e) => setSensorForm({ ...sensorForm, ccpId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">None (Standalone Monitoring)</option>
                    {ccps.map((ccp) => (
                      <option key={ccp.id} value={ccp.id}>
                        {ccp.code} - {ccp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSensorModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Deploy Sensor Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INGEST / BREACH SIMULATION MODAL */}
      {simulatingSensor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Ingest Telemetry Reading</h3>
            <p className="text-slate-400">
              Sensor Node: <strong className="text-cyan-400 font-mono">{simulatingSensor.sensorCode}</strong> ({simulatingSensor.name})
            </p>

            <form onSubmit={handleIngestSimulatedTelemetry} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Telemetry Value ({simulatingSensor.type === SensorType.TEMPERATURE ? '°C' : '%RH'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={simValue}
                  onChange={(e) => setSimValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Battery Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={simBattery}
                  onChange={(e) => setSimBattery(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              {simulationResult && (
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    simulationResult.violationTriggered
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {simulationResult.violationTriggered ? (
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>AUTOMATED CCP BREACH VIOLATION CREATED!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Telemetry Ingested cleanly. Reading is within CCP limits.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSimulatingSensor(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-cyan-600 text-white hover:bg-cyan-500 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Ingest & Evaluate CCP Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTMonitoringPage;
