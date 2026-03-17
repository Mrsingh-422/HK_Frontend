'use client'

import { createContext, useContext, useState } from "react";
import axios from "axios";

const AdminContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AdminProvider = ({ children }) => {

    const saveHomePageContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/main`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving home page content:", error);
            throw error;
        }
    }

    const addDoctorTeam = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/doctorsteam`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error adding doctor team:", error);
            throw error;
        }
    }

    const saveAboutUsContent = async (data) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `${API_URL}/api/homepage/about-us`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error saving about us content:", error);
            throw error;
        }
    };

    const saveIntroductionPageContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/introduction`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving introduction page content:", error);
            throw error;
        }
    }

    const saveFeaturedProductsContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/featured-products`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving featured products content:", error);
            throw error;
        }
    }

    const saveLaboratoryContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/laboratory`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving laboratory content:", error);
            throw error;
        }
    }

    const saveNursingContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/nursing`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving nursing content:", error);
            throw error;
        }
    }

    const saveAmbulanceContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/ambulance`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving ambulance content:", error);
            throw error;
        }
    }

    const saveHospitalContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/hospitals`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving hospital content:", error);
            throw error;
        }
    }

    const addDoctorInDoctorsTeam = async (formData) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `${API_URL}/api/homepage/doctorsteam`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error adding doctor team:", error);
            throw error;
        }
    };

    const updateDoctorInDoctorsTeam = async (id, formData) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.put(
                `${API_URL}/api/homepage/doctorsteam/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error updating doctor in doctors team:", error);
            throw error;
        }
    };

    const deleteDoctorInDoctorsTeam = async (id) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.delete(
                `${API_URL}/api/homepage/doctorsteam/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error deleting doctor in doctors team:", error);
            throw error;
        }
    };

    const saveOurAffiliatesContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/ouraffiliates`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving our affiliates content:", error);
            throw error;
        }
    }

    // lab page functions 
    const saveSearchTestData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/search-test`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving search test data:", error);
            throw error;
        }
    };

    const savePrescriptionPageData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/prescription-test`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving prescription page data:", error);
            throw error;
        }
    };

    const saveHowItWorksContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/how-it-works`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving how it works content:", error);
            throw error;
        }
    };

    const saveLabCareContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/lab-care`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving lab care content:", error);
            throw error;
        }
    };

    const saveAboutLabContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/about-lab`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving about lab content:", error);
            throw error;
        }
    };

    const saveResearchContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/labpage/research`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving research content:", error);
            throw error;
        }
    };


    //doctor appointment functions 
    const saveFindDoctorContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/finddoctor`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving find doctor content:", error);
            throw error;
        }
    };

    const saveFindConsultantContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/findconsultant`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving find consultant content:", error);
            throw error;
        }
    };

    const saveDoctorsPriorityContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/doctorspriority`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving doctors priority content:", error);
            throw error;
        }
    };

    const saveHowToSecureContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/howtosecure`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving how to secure content:", error);
            throw error;
        }
    };


    //Online Pharmacy functions

    const savePharmacyPageContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/pharmacypage`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving pharmacy page content:", error);
            throw error;
        }
    };

    const saveFeaturedProductsContentPharmacy = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/featuredproducts`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving featured products content:", error);
            throw error;
        }
    };

    const saveBestOfBestContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/bestofbest`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving best of best content:", error);
            throw error;
        }
    };

    const saveRecommendedMedContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/recommendedmed`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving recommended med content:", error);
            throw error;
        }
    };

    const saveAboutMedicineContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/aboutmedicine`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving about medicine content:", error);
            throw error;
        }
    };

    //Ambulance functions
    const saveAmbulancePageData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/hero`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving ambulance page data:", error);
            throw error;
        }
    };
    const saveReferralPageData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/referral-hero`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving referral page data:", error);
            throw error;
        }
    };
    const saveEmergencyFacilityData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/emergency-facility`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving emergency facility data:", error);
            throw error;
        }
    };
    const saveAccidentalEmergencyData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/accidental-emergency`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving accidental emergency data:", error);
            throw error;
        }
    };
    const saveMedicalEmergencyData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/medical-emergency`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving medical emergency data:", error);
            throw error;
        }
    };
    const saveReferralAmbulanceContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/ambulancepage/referral-services`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving referral ambulance content:", error);
            throw error;
        }
    };



    //Nurse functions
    const saveNursePageData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/nursepage`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving nurse page data:", error);
            throw error;
        }
    };

    const saveNursePrescriptionData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/nurseprescription`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving nurse prescription data:", error);
            throw error;
        }
    };

    const saveNursingStepsData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/nursingsteps`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving nursing steps data:", error);
            throw error;
        }
    };

    const saveOurNursingServicesContent = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/ournursingservices`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving our nursing services content:", error);
            throw error;
        }
    };

    const saveExperiencedNursesData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/experiencednurses`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving experienced nurses data:", error);
            throw error;
        }
    };

    const saveOnlyTheBestCareData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/homepage/onlybestcare`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving only the best care content:", error);
            throw error;
        }
    };


    //Hospital functions 

    const saveSingleHospitalPageData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/hospitalpage/hero`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving hospital page data:", error);
            throw error;
        }
    };
    const saveHospitalFacilityData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/hospitalpage/facility`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving hospital facility data:", error);
            throw error;
        }
    };
    const saveMainHowItWorksData = async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${API_URL}/api/hospitalpage/how-it-works`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error("Error saving main how it works data:", error);
            throw error;
        }
    };





    return (
        <AdminContext.Provider value={{
            saveHomePageContent,
            addDoctorTeam,
            saveIntroductionPageContent,
            saveAboutUsContent,
            saveFeaturedProductsContent,
            saveLaboratoryContent,
            saveOurAffiliatesContent,
            saveNursingContent,
            saveAmbulanceContent,
            saveHospitalContent,
            addDoctorInDoctorsTeam,
            updateDoctorInDoctorsTeam,
            deleteDoctorInDoctorsTeam,


            saveSearchTestData,
            savePrescriptionPageData,
            saveHowItWorksContent,
            saveLabCareContent,
            saveAboutLabContent,
            saveResearchContent,

            savePharmacyPageContent,
            saveFeaturedProductsContentPharmacy,
            saveBestOfBestContent,
            saveRecommendedMedContent,
            saveAboutMedicineContent,


            saveFindDoctorContent,
            saveFindConsultantContent,
            saveDoctorsPriorityContent,
            saveHowToSecureContent,

            saveAmbulancePageData,
            saveReferralPageData,
            saveEmergencyFacilityData,
            saveAccidentalEmergencyData,
            saveMedicalEmergencyData,
            saveReferralAmbulanceContent,

            saveNursePageData,
            saveNursePrescriptionData,
            saveNursingStepsData,
            saveOurNursingServicesContent,
            saveExperiencedNursesData,
            saveOnlyTheBestCareData,

            saveSingleHospitalPageData,
            saveHospitalFacilityData,
            saveMainHowItWorksData,


        }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminContext = () => {
    return useContext(AdminContext);
}