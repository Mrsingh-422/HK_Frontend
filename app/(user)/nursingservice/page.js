'use client'

import React from 'react'
import SecondNavbar from '../components/SecondNavbar'
import FindMyNurse from './components/FindMyNurse'
import FindMyNurseTwo from './components/FindMyNurseTwo'
import AllNursingServices from './components/AllNursingServices'
import NursePackages from './components/NursePackages'
import NursingPosts from './components/NursingPosts'

function page() {
    return (
        <>
            <SecondNavbar />
            <FindMyNurse />
            <FindMyNurseTwo />
            <AllNursingServices />
            <NursePackages />
            <NursingPosts />
        </>
    )
}

export default page