'use client'

import React from 'react'
import OnlinePharmacy from './components/OnlinePharmacy'
import SecondNavbar from '../components/SecondNavbar'
import FeaturedProducts from './components/FeaturedProducts'
import DeclareThePast from './components/DeclareThePast'
import TheBestOfBest from './components/TheBestOfBest'
import BestSellings from './components/BestSellings'
import RecomendedMedicines from './components/RecomendedMedicines'
import AboutUsMed from './components/AboutUsMed'
import FromHealthMed from './components/FromHealthMed'
import OurPharmacyPartners from './components/OurPharmacyPartners'
import NearByMedicines from './components/NearByMedicines'
import BrandLogos from './components/BrandLogos'
import PharmaciesNearMe from './components/PharmaciesNearMe'

function page() {
    return (
        <>
            <SecondNavbar />
            <OnlinePharmacy />
            <NearByMedicines />
            <BrandLogos />
            <PharmaciesNearMe />
            {/* <FeaturedProducts /> */}
            {/* <DeclareThePast /> */}
            {/* <TheBestOfBest /> */}
            {/* <BestSellings /> */}
            {/* <RecomendedMedicines /> */}
            {/* <AboutUsMed /> */}
            {/* <OurPharmacyPartners /> */}
            <FromHealthMed />
        </>
    )
}

export default page