'use client'

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import FindEmergencyAmbulance from './components/FindEmergencyAmbulance'
import FindReferralAmbulance from './components/FindReferralAmbulance'
import EmergencyAmbulanceFacility from './components/EmergencyAmbulanceFacility'
import AccidentalEmergency from './components/AccidentalEmergency'
import MedicalEmergency from './components/MedicalEmergency'
import ReferralAmbulanceServices from './components/ReferralAmbulanceServices'
import AmbulancePartners from './components/AmbulancePartners'
import AmbulanceHero from './components/AmbulanceHero'
import HowToBookAmbulance from './components/HowToBookAmbulance'
import AmbulanceEquipment from './components/AmbulanceEquipment'

function page() {
    return (
        <>
            <SecondNavbar />
            <AmbulanceHero />
            <FindEmergencyAmbulance />
            {/* <FindReferralAmbulance /> */}
            <EmergencyAmbulanceFacility />
            <HowToBookAmbulance/>
            <AmbulanceEquipment />
            {/* <AccidentalEmergency /> */}
            <MedicalEmergency />
            {/* <ReferralAmbulanceServices /> */}
            <AmbulancePartners />
        </>
    )
}

export default page