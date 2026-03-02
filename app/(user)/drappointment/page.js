'use client'

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import FindMyDoctor from './components/FindMyDoctor'
import OurAllSpecialistsTeam from './components/OurAllSpecialistsTeam'
import OurSpecialities from './components/OurSpecialities'
import OurDoctorsOurPriority from './components/OurDoctorsOurPriority'
import HowToSecure from './components/HowToSecure'
import FromHealthDr from './components/FromHealthDr'

function page() {
  return (
    <>
    <SecondNavbar />
    <FindMyDoctor />
    <OurAllSpecialistsTeam />
    <OurSpecialities />
    <OurDoctorsOurPriority />
    <HowToSecure />
    <FromHealthDr />
    </>
  )
}

export default page