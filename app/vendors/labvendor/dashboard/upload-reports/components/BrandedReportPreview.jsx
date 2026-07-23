'use client'
import React from 'react'
import ReportCoverPage from './ReportCoverPage'
import ReportSummaryParametersPage from './ReportSummaryParametersPage'
import ReportDetailedAssaysPage from './ReportDetailedAssaysPage'
import ReportAppPromoPage from './ReportAppPromoPage'

// Custom biological system icons
const ThyroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-500" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
  </svg>
);

const LipidHeartIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const KidneyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export default function BrandedReportPreview({ order, patientId, testResultsData }) {
  if (!order) return null;

  // Resolve Target Patient
  const patient = order.patients?.find(p => (p.patientId || p._id) === patientId) || order.patients?.[0];
  const patientName = patient?.name || patient?.patientName || order.userId?.name || 'Mrs Kriti Tiwari';
  const patientAge = patient?.age || patient?.patientAge || '31';
  const patientGender = patient?.gender || 'Female';

  const tests = testResultsData || order.testResults || [];

  // evaluate ranges helper
  const evaluateRange = (value, min, max) => {
    if (!value || isNaN(value)) return 'normal';
    const val = parseFloat(value);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (!isNaN(minVal) && val < minVal) return 'low';
    if (!isNaN(maxVal) && val > maxVal) return 'high';
    return 'normal';
  };

  // Compile calculations
  let totalParams = 0;
  let normalParams = 0;
  const outOfRangeList = [];
  tests.forEach(test => {
    test.parameters?.forEach(p => {
      totalParams++;
      const status = evaluateRange(p.value, p.minRef, p.maxRef);
      if (status === 'normal') {
        normalParams++;
      } else {
        outOfRangeList.push({ name: p.name, status, value: p.value });
      }
    });
  });

  const healthScore = totalParams > 0 ? Math.round((normalParams / totalParams) * 100) : 86;

  // Compile Organ Status Card maps
  const findParameter = (keywords) => {
    let matchedParam = null;
    tests.forEach(test => {
      test.parameters?.forEach(p => {
        if (keywords.some(kw => p.name.toLowerCase().includes(kw.toLowerCase()))) {
          matchedParam = p;
        }
      });
    });
    return matchedParam;
  };

  const getOrganStatusCard = (title, keywords, subtitle, iconObj) => {
    const p = findParameter(keywords);
    if (!p) {
      return {
        title,
        subtitle: 'Test parameter not configured',
        value: 'N/A',
        status: 'not_taken',
        icon: iconObj
      };
    }
    const status = evaluateRange(p.value, p.minRef, p.maxRef);
    const displayVal = `${p.value} ${p.unit}`;
    return {
      title,
      subtitle: `${p.name}: ${displayVal}`,
      value: displayVal,
      status: status !== 'normal' ? 'Concern' : 'Optimal',
      icon: iconObj
    };
  };

  const organCards = [
    getOrganStatusCard('Thyroid Function', ['tsh', 'thyroid'], 'Thyroid Stimulating Hormone', <ThyroidIcon />),
    getOrganStatusCard('Cholesterol Total', ['cholesterol', 'lipid'], 'Lipids Screen', <LipidHeartIcon />),
    getOrganStatusCard('Kidney Function', ['creatinine', 'gfr', 'urea'], 'Serum Creatinine', <KidneyIcon />),
    getOrganStatusCard('Vitamin D', ['vitamin d', 'vit d'], 'Calciferol Profile', <ThyroidIcon />),
    getOrganStatusCard('HbA1c', ['hba1c', 'glycated'], 'Average Blood Glucose', <LipidHeartIcon />),
    getOrganStatusCard('Vitamin B12', ['b12', 'cobalamin'], 'Vitamin B12 Levels', <ThyroidIcon />),
    getOrganStatusCard('Liver Function', ['sgpt', 'alt', 'sgot', 'ast'], 'Alanine Aminotransferase', <LipidHeartIcon />),
    getOrganStatusCard('Calcium Total', ['calcium'], 'Serum Calcium', <KidneyIcon />),
    getOrganStatusCard('Iron Studies', ['iron', 'ferritin'], 'Iron Screen Profile', <ThyroidIcon />),
    getOrganStatusCard('Complete Hemogram', ['haemoglobin', 'hemoglobin', 'hb'], 'Haemoglobin (HB)', <LipidHeartIcon />)
  ];

  // Recommendations builder
  const recommendations = [];
  const issues = outOfRangeList.map(item => item.name.toLowerCase());
  
  if (issues.some(name => name.includes('vitamin d') || name.includes('vit d'))) {
    recommendations.push({
      id: '01',
      title: 'Focus on Vitamin D Rich Foods and Safe Sun Exposure:',
      desc: 'To help increase your Vitamin D levels, consider incorporating more Vitamin D-rich foods into your diet, such as fatty fish, fortified dairy products, and eggs. Additionally, safe and moderate sun exposure can be beneficial.',
    });
  } else {
    recommendations.push({
      id: '01',
      title: 'Maintain General Micronutrients Intake:',
      desc: 'Continue eating a balanced diet rich in leafy greens, nuts, and clean proteins to sustain optimal systemic nutrient reserves.',
    });
  }

  if (issues.some(name => name.includes('haemoglobin') || name.includes('hemoglobin') || name.includes('hb'))) {
    recommendations.push({
      id: '02',
      title: 'Enhance Your Diet for Blood Health:',
      desc: 'To support your hemoglobin and red blood cell levels, its beneficial to increase your intake of iron-rich foods. This includes lean red meats, poultry, fish, beans, lentils, spinach, and fortified cereals. Pairing these with Vitamin C-rich foods can help improve iron absorption.',
    });
  } else {
    recommendations.push({
      id: '02',
      title: 'Sustain Cardiorespiratory Conditioning:',
      desc: 'Engage in moderate-intensity cardiovascular activities (30 minutes daily) to support blood circulation and red blood cell health.',
    });
  }

  if (issues.some(name => name.includes('cholesterol') || name.includes('lipid') || name.includes('triglycerides'))) {
    recommendations.push({
      id: '03',
      title: 'Support Your Cholesterol and Overall Heart Health:',
      desc: 'To help improve your HDL cholesterol, focus on a heart-healthy diet. This includes consuming healthy fats found in avocados, nuts, seeds, and olive oil. Reducing intake of saturated and trans fats, found in fried foods and processed snacks, is also important.',
    });
  } else {
    recommendations.push({
      id: '03',
      title: 'Maintain Cardiovascular Lipid Balance:',
      desc: 'Continue consuming omega-rich healthy fats and dietary fiber to keep your lipid profile well-balanced.',
    });
  }

  if (issues.some(name => name.includes('creatinine') || name.includes('urea') || name.includes('gfr'))) {
    recommendations.push({
      id: '04',
      title: 'Prioritize Hydration and Balanced Nutrition:',
      desc: 'To support your kidney and liver function, ensuring adequate hydration throughout the day is crucial. A balanced diet that includes a variety of fruits, vegetables, whole grains, and lean proteins will provide the necessary nutrients to support these organs.',
    });
  } else {
    recommendations.push({
      id: '04',
      title: 'Maintain Optimal System Hydration:',
      desc: 'Keep up a healthy daily fluid intake (2 to 3 liters of pure water) to assist renal clearances.',
    });
  }

  return (
    <div className="w-full bg-slate-500/10 p-2 md:p-8 space-y-12 overflow-y-auto max-h-[82vh] rounded-2xl flex flex-col items-center">
      
     {/* Page 1 */}
      <ReportCoverPage 
        order={order}
        patientName={patientName}
        patientAge={patientAge}
        patientGender={patientGender}
        labName={order?.labId?.name || order?.labName || order?.labDepositName || "HK Clinic"}
      />

     {/* Page 2 */}
      <ReportSummaryParametersPage 
        order={order}
        patientName={patientName}
        healthScore={healthScore}
        organCards={organCards}
      />

      {/* Page 3 */}
       <ReportDetailedAssaysPage 
        order={order}
        patientName={patientName}
        patientAge={patientAge}
        patientGender={patientGender}
        tests={tests}
        evaluateRange={evaluateRange}
      />

      {/* Page 4 */}
       <ReportAppPromoPage />


      

    </div>
  )
}