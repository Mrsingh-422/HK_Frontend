"use client";
import { createContext, useContext, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [username, setUsername] = useState("Khanday");
    const [loading, setLoading] = useState(false);
    const [allSpecializations, setAllSpecializations] = useState([])
    const [allQualifications, setAllQualifications] = useState([])

    // ===============================
    // GET ALL COUNTRIES
    // ===============================
    const getAllCountries = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/public/countries`
            );

            return response.data.data; // return only array

        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch countries";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // GET STATES BY COUNTRY ID
    // ===============================
    const getStatesByCountry = async (countryId) => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/public/states?country_id=${countryId}`
            );

            return response.data.data;

        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch states";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // GET CITIES BY STATE ID
    // ===============================
    const getCitiesByState = async (stateId) => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/public/cities?state_id=${stateId}`
            );

            return response.data.data;

        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch cities";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    };

    const getDoctorSpecializations = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/admin/doctor-data/specializations`
            );
            console.log(response.data.data)
            setAllSpecializations(response.data.data)
            return response.data.data; // return only array

        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch countries";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    }

    const getDoctorQualifications = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${API_URL}/admin/doctor-data/qualifications`
            );
            console.log(response.data.data)
            setAllQualifications(response.data.data)
            return response.data.data; // return only array

        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch countries";
            return Promise.reject(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <UserContext.Provider
            value={{
                username,
                getAllCountries,
                getStatesByCountry,
                getCitiesByState,
                loading,
                getDoctorSpecializations,
                getDoctorQualifications,
                allSpecializations,
                allQualifications,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
