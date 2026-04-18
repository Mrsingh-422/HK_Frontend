"use client";

import SecondNavbar from "./components/SecondNavbar";
import HeroSection from "./components/HeroSection";
import OurIntroduction from "./components/mainPageComponents/ourIntroduction/OurIntroduction";
import AboutUs from "./components/mainPageComponents/aboutUs/AboutUs";
import Medicines from "./components/mainPageComponents/medicines/Medicines";
import Laboratory from "./components/mainPageComponents/laboratory/Laboratory";
import DoctorsTeam from "./components/mainPageComponents/doctorsTeam/DoctorsTeam";
import GetHealthApp from "./components/mainPageComponents/getHealthApp/GetHealthApp";
import Nursing from "./components/mainPageComponents/nursing/Nursing";
import Hospitals from "./components/mainPageComponents/hospitals/Hospitals";
import AmbulanceFacility from "./components/mainPageComponents/ambulanceFacility/AmbulanceFacility";
import OurAffiliates from "./components/mainPageComponents/ourAffiliates/OurAffiliates";
import FewArticles from "./components/mainPageComponents/fewArticles/FewArticles";
import Faqs from "./components/mainPageComponents/faqs/Faqs";
import MedicineComponent from "./components/mainPageComponents/MedicineComponent";
import PersonalCare from "./components/mainPageComponents/PersonalCare";
import SomeDesign from "./components/mainPageComponents/SomeDesign";
import LabTests from "./components/mainPageComponents/LabTests";
import LabPackages from "./components/mainPageComponents/LabPackages";
import Ayurveda from "./components/mainPageComponents/Ayurveda";
import AppointmentComponent from "./components/mainPageComponents/AppointmentComponent";
import NewArrivals from "./components/mainPageComponents/NewArrivals";
import HospitalsMainPage from "./components/mainPageComponents/HospitalsMainPage";
import NurseSection from "./components/mainPageComponents/NurseSection";

export default function Home() {
  return (
    <>
      <SecondNavbar />
      <HeroSection />
      {/* <OurIntroduction /> */}
      <NewArrivals />
      <MedicineComponent />
      <AppointmentComponent />
      <PersonalCare />
      <LabTests />
      <SomeDesign />
      <LabPackages />
      <Ayurveda />
      <HospitalsMainPage />
      <NurseSection />
      {/* <AboutUs /> */}
      {/* <Medicines /> */}
      {/* <Laboratory /> */}
      {/* <DoctorsTeam /> */}
      {/* <GetHealthApp /> */}
      {/* <Nursing /> */}
      {/* <AmbulanceFacility /> */}
      {/* <Hospitals /> */}
      {/* <OurAffiliates /> */}
      {/* <FewArticles /> */}
      {/* <Faqs /> */}
    </>
  );
}
