'use client'

import React from 'react'
import OnlinePharmacy from './components/OnlinePharmacy'
import SecondNavbar from '../components/SecondNavbar'
import FeaturedProducts from './components/FeaturedProducts'

function page() {
    return (
        <>
            <SecondNavbar />
            <OnlinePharmacy />
            <FeaturedProducts />
        </>
    )
}

export default page