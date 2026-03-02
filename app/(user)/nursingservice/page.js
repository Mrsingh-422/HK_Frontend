'use client'

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import FindMyNurse from './components/FindMyNurse'
import FindMyNurseTwo from './components/FindMyNurseTwo'
import AllNursingServices from './components/AllNursingServices'
import NursePackages from './components/NursePackages'
import NursingPosts from './components/NursingPosts'
import OurNursingServices from './components/OurNursingServices'
import ExperiencedNurses from './components/ExperiencedNurses'
import OnlyTheBestCare from './components/OnlyTheBestCare'
import OurNursingPartners from './components/OurNursingPartners'
import FromHealthNursing from './components/FromHealthNursing'

function page() {
    return (
        <>
            <SecondNavbar />
            <FindMyNurse />
            <FindMyNurseTwo />
            <AllNursingServices />
            <NursePackages />
            <NursingPosts />
            <OurNursingServices />
            <ExperiencedNurses />
            <OnlyTheBestCare />
            <OurNursingPartners />
            <FromHealthNursing />
        </>
    )
}

export default page