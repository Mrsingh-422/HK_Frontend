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
import SkinCareProducts from './components/SkinCareProducts'
import DealOfTheDay from './components/DealOfTheDay'
import FitnessProducts from './components/FitnessProducts'
import Devices from './components/Devices'
import AyurvedaMedicines from './components/AyurvedaMedicines'
import SuperSaving from './components/SuperSaving'

function page() {
    return (
        <>
            <SecondNavbar />
            <OnlinePharmacy />
            <SuperSaving />
            <NearByMedicines />
            <SkinCareProducts />
            <FitnessProducts />
            <Devices />
            <AyurvedaMedicines />
            {/* <DealOfTheDay /> */}
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