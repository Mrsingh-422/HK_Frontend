"use client"

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import BookYourDiseaseTest from './components/BookYourDiseaseTest'
import BookYourPrescriptionTest from './components/BookYourPrescriptionTest'
import HealthPackages from './components/HealthPackages'
import PopularTest from './components/PopularTest'
import YourLifecycleDisorders from './components/YourLifecycleDisorders'
import MonthlyOffers from './components/MonthlyOffers'
import HowItWorks from './components/HowItWorks'
import LabCare from './components/LabCare'
import AboutUsLaboratory from './components/AboutUsLaboratory'
import ResearchAndVerify from './components/ResearchAndVerify'
import OurPartners from './components/OurPartners'
import FromHealth from './components/FromHealth'

function page() {
  return (
    <div>
      <SecondNavbar />
      <BookYourDiseaseTest />
      <BookYourPrescriptionTest />
      <HealthPackages />
      <PopularTest />
      <YourLifecycleDisorders />
      <MonthlyOffers />
      <HowItWorks />
      <LabCare />
      <AboutUsLaboratory />
      <ResearchAndVerify />
      <OurPartners />
      <FromHealth />
    </div>
  )
}

export default page