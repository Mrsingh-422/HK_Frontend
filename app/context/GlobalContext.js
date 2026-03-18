"use client";
import { createContext, useContext, useState } from "react";
import axios from "axios";

const GlobalContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const GlobalProvider = ({ children }) => {
    const [user, setUser] = useState("Mudabir");
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const openModal = (type) => {
        setModalType(type);
    };
    const closeModal = () => {
        setModalType(null);
    };

    const getHomePageContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/main`);
            return response.data;
        } catch (error) {
            console.error("Error getting home page content:", error);
            throw error;
        }
    }
    const getAboutUsContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/about-us`);
            return response.data;
        } catch (error) {
            console.error("Error getting about us content:", error);
            throw error;
        }
    }
    const getIntroductionPageContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/introduction`);
            return response.data;
        } catch (error) {
            console.error("Error getting introduction page content:", error);
            throw error;
        }
    }
    const getFeaturedProductsContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/featured-products`);
            return response.data;
        } catch (error) {
            console.error("Error getting featured products content:", error);
            throw error;
        }
    }
    const getLaboratoryContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/laboratory`);
            return response.data;
        } catch (error) {
            console.error("Error getting laboratory content:", error);
            throw error;
        }
    }
    const getNursingContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/nursing`);
            return response.data;
        } catch (error) {
            console.error("Error getting nursing content:", error);
            throw error;
        }
    }
    const getAmbulanceContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/ambulance`);
            return response.data;
        } catch (error) {
            console.error("Error getting ambulance content:", error);
            throw error;
        }
    }
    const getHospitalContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/hospitals`);
            return response.data;
        } catch (error) {
            console.error("Error getting hospital content:", error);
            throw error;
        }
    }
    const getOurAffiliatesContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/ouraffiliates`);
            return response.data;
        } catch (error) {
            console.error("Error getting our affiliates content:", error);
            throw error;
        }
    }
    const getDoctorTeamContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/doctorsteam`);
            return response.data;
        } catch (error) {
            console.error("Error getting doctor team content:", error);
            throw error;
        }
    }


    // Lab Page functions 
    const getSearchTestData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/search-test`);
            return response.data;
        } catch (error) {
            console.error("Error getting search test data:", error);
            throw error;
        }
    };
    const getPrescriptionPageData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/prescription-test`);
            return response.data;
        } catch (error) {
            console.error("Error getting prescription page data:", error);
            throw error;
        }
    };
    const getHowItWorksContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/how-it-works`);
            return response.data;
        } catch (error) {
            console.error("Error getting how it works content:", error);
            throw error;
        }
    };
    const getLabCareContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/lab-care`);
            return response.data;
        } catch (error) {
            console.error("Error getting lab care content:", error);
            throw error;
        }
    };
    const getAboutLabContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/about-lab`);
            return response.data;
        } catch (error) {
            console.error("Error getting about lab content:", error);
            throw error;
        }
    };
    const getResearchContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/labpage/research`);
            return response.data;
        } catch (error) {
            console.error("Error getting research content:", error);
            throw error;
        }
    };

    //doctor page starts
    const getFindDoctorContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointmentpage/find-doctor`);
            return response.data;
        } catch (error) {
            console.error("Error getting find doctor content:", error);
            throw error;
        }
    };
    const getFindConsultantContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointmentpage/find-consultant`);
            return response.data;
        } catch (error) {
            console.error("Error getting find consultant content:", error);
            throw error;
        }
    };
    const getDoctorsPriorityContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointmentpage/doctors-priority`);
            return response.data;
        } catch (error) {
            console.error("Error getting doctors priority content:", error);
            throw error;
        }
    };
    const getHowToSecureContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/appointmentpage/how-to-secure`);
            return response.data;
        } catch (error) {
            console.error("Error getting how to secure content:", error);
            throw error;
        }
    };

    //Online Pharmacy functions
    const getPharmacyPageContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/medicinepage/pharmacy-main`);
            return response.data;
        } catch (error) {
            console.error("Error getting pharmacy page content:", error);
            throw error;
        }
    };
    const getFeaturedProductsContentPharmacy = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/homepage/featuredproducts`);
            return response.data;
        } catch (error) {
            console.error("Error getting featured products content:", error);
            throw error;
        }
    };
    const getDeclarePastContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/medicinepage/declare-past`);
            return response.data;
        } catch (error) {
            console.error("Error getting DeclarePast content:", error);
            throw error;
        }
    };
    const getBestOfBestContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/medicinepage/best-of-best`);
            return response.data;
        } catch (error) {
            console.error("Error getting best of best content:", error);
            throw error;
        }
    };
    const getRecommendedMedContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/medicinepage/recommended`);
            return response.data;
        } catch (error) {
            console.error("Error getting recommended med content:", error);
            throw error;
        }
    };

    const getAboutMedicineContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/medicinepage/about`);
            return response.data;
        } catch (error) {
            console.error("Error getting about medicine content:", error);
            throw error;
        }
    };


    //Ambulance functions
    const getAmbulancePageData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/hero`);
            return response.data;
        } catch (error) {
            console.error("Error getting ambulance page content:", error);
            throw error;
        }
    };
    const getReferralPageData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/referral-hero`);
            return response.data;
        } catch (error) {
            console.error("Error getting referral ambulance content:", error);
            throw error;
        }
    };
    const getEmergencyFacilityData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/emergency-facility`);
            return response.data;
        } catch (error) {
            console.error("Error getting emergency facility content:", error);
            throw error;
        }
    };
    const getAccidentalEmergencyData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/accidental-emergency`);
            return response.data;
        } catch (error) {
            console.error("Error getting accidental emergency content:", error);
            throw error;
        }
    };
    const getMedicalEmergencyData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/medical-emergency`);
            return response.data;
        } catch (error) {
            console.error("Error getting medical emergency content:", error);
            throw error;
        }
    };
    const getReferralAmbulanceContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ambulancepage/referral-services`);
            return response.data;
        } catch (error) {
            console.error("Error getting referral ambulance content:", error);
            throw error;
        }
    };


    //Nursing functions 
    const getNursePageData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/hero`);
            return response.data;
        } catch (error) {
            console.error("Error getting nurse page data:", error);
            throw error;
        }
    };
    const getNursePrescriptionData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/prescription`);
            return response.data;
        } catch (error) {
            console.error("Error getting nurse prescription data:", error);
            throw error;
        }
    };
    const getNursingStepsData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/steps`);
            return response.data;
        } catch (error) {
            console.error("Error getting nursing steps data:", error);
            throw error;
        }
    };
    const getOurNursingServicesContent = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/services`);
            return response.data;
        } catch (error) {
            console.error("Error getting our nursing services content:", error);
            throw error;
        }
    };
    const getExperiencedNursesData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/experienced-nurses`);
            return response.data;
        } catch (error) {
            console.error("Error getting experienced nurses data:", error);
            throw error;
        }
    };
    const getOnlyTheBestCareData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nursepage/best-care`);
            return response.data;
        } catch (error) {
            console.error("Error getting only the best care content:", error);
            throw error;
        }
    };


    //Hospital functions 
    const getSingleHospitalPageData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/hospitalpage/hero`);
            return response.data;
        } catch (error) {
            console.error("Error getting hospital page data:", error);
            throw error;
        }
    };
    const getHospitalFacilityData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/hospitalpage/facility`);
            return response.data;
        } catch (error) {
            console.error("Error getting hospital facility data:", error);
            throw error;
        }
    };
    const getMainHowItWorksData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/hospitalpage/how-it-works`);
            return response.data;
        } catch (error) {
            console.error("Error getting main how it works data:", error);
            throw error;
        }
    };



    return (
        <GlobalContext.Provider
            value={{
                user, setUser, loading, modalType, openModal, closeModal, sidebarOpen, toggleSidebar,

                getAboutUsContent, getFeaturedProductsContent, getHomePageContent, getIntroductionPageContent, getLaboratoryContent, getOurAffiliatesContent, getDoctorTeamContent, getNursingContent, getAmbulanceContent, getHospitalContent,

                getSearchTestData, getPrescriptionPageData, getHowItWorksContent, getLabCareContent, getAboutLabContent, getResearchContent,

                getPharmacyPageContent, getFeaturedProductsContentPharmacy, getBestOfBestContent, getRecommendedMedContent, getAboutMedicineContent, getDeclarePastContent,

                getFindDoctorContent, getFindConsultantContent, getDoctorsPriorityContent, getHowToSecureContent,

                getAmbulancePageData, getReferralPageData, getEmergencyFacilityData, getAccidentalEmergencyData, getMedicalEmergencyData, getReferralAmbulanceContent,

                getNursePageData, getNursePrescriptionData, getNursingStepsData, getOurNursingServicesContent, getExperiencedNursesData, getOnlyTheBestCareData,

                getSingleHospitalPageData, getHospitalFacilityData, getMainHowItWorksData,

            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);