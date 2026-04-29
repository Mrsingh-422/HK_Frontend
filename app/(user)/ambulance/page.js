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

function page() {
    return (
        <>
            <SecondNavbar />
            <FindEmergencyAmbulance />
            {/* <FindReferralAmbulance /> */}
            <EmergencyAmbulanceFacility />
            <AccidentalEmergency />
            <MedicalEmergency />
            <ReferralAmbulanceServices />
            <AmbulancePartners />
        </>
    )
}

export default page