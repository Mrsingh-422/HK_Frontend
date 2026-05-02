'use client'

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import FindHospital from './components/FindHospital'
import HospitalFacilities from './components/HospitalFacilities'
import HowItWorks from './components/HowItWorks'
import OurHospitalPartners from './components/OurHospitalPartners'
import FromHealthHospital from './components/FromHealthHospital'
import HospitalHero from './components/HospitalHero'

function page() {
    return (
        <>
            <SecondNavbar />
            <HospitalHero />
            <FindHospital />
            <HospitalFacilities />
            <HowItWorks />
            <OurHospitalPartners />
            <FromHealthHospital />
        </>
    )
}

export default page