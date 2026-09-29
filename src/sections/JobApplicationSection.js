import React, { useState } from 'react';
import SectionRunner from './SectionRunner';
import { JOB_APPLICATION_STEPS } from '../config/steps/jobApplication';

// Job application through offer acceptance. Owns the applicant's own answers locally;
// only the chosen region is reported upward, since currency display needs it elsewhere.
// The actual screen order lives in src/config/steps/jobApplication.js.
export default function JobApplicationSection({ onComplete, onRegionChange }) {
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [interests, setInterests] = useState([]);

  const handleSetRegion = (value) => {
    setRegion(value);
    if (onRegionChange) onRegionChange(value);
  };

  const context = {
    onComplete,
    employeeId, setEmployeeId,
    designation, setDesignation,
    age, setAge,
    region, setRegion: handleSetRegion,
    interests, setInterests,
    userData: { designation, age, region, interests },
  };

  return <SectionRunner steps={JOB_APPLICATION_STEPS} context={context} />;
}
