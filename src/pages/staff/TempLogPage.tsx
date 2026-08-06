import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TemperatureLogForm } from '../../components/staff/TemperatureLogForm';
import { MOCK_DAILY_LOGS } from '../../data/mockData';

/**
 * TempLogPage Component
 * Route wrapper for /staff/temp-check using the reusable TemperatureLogForm component.
 */
export const TempLogPage: React.FC = () => {
  const navigate = useNavigate();

  // Find the primary CCP temperature log task (Morning Walk-In Fridge)
  const defaultTempLog = MOCK_DAILY_LOGS.find((l) => l.category === 'temperature') ?? MOCK_DAILY_LOGS[0];

  const handleSaveSuccess = () => {
    setTimeout(() => {
      navigate('/staff/dashboard');
    }, 1200);
  };

  const handleCancel = () => {
    navigate('/staff/dashboard');
  };

  return (
    <div className="py-2">
      <TemperatureLogForm
        log={defaultTempLog}
        onSaveSuccess={handleSaveSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
