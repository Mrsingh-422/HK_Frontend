"use client";

import React, { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";

function EditSubadmin({ user, onClose }) {
    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        phone: "",
        address: "",
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        city: "",
        image: "",
    });

    const [previewImage, setPreviewImage] = useState(null);

    // ✅ Load existing user data
    useEffect(() => {
        if (user) {
            const selectedCountry = countries.find(
                (c) => c.name === user.country
            );

            const countryCode = selectedCountry?.isoCode || "";

            const stateList = State.getStatesOfCountry(countryCode);
            const selectedState = stateList.find(
                (s) => s.name === user.state
            );

            const stateCode = selectedState?.isoCode || "";

            const cityList = City.getCitiesOfState(countryCode, stateCode);

            setStates(stateList);
            setCities(cityList);

            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: user.password || "",
                role: user.role || "",
                phone: user.phone || "",
                address: user.address || "",
                country: user.country || "",
                countryCode,
                state: user.state || "",
                stateCode,
                city: user.city || "",
                image: user.image || "",
            });

            setPreviewImage(user.image);
        }
    }, [user, countries]);

    // ✅ Handle normal inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Handle Country Change
    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        const selectedCountry = countries.find(
            (c) => c.isoCode === countryCode
        );

        const stateList = State.getStatesOfCountry(countryCode);

        setStates(stateList);
        setCities([]);

        setFormData({
            ...formData,
            country: selectedCountry.name,
            countryCode,
            state: "",
            stateCode: "",
            city: "",
        });
    };

    // ✅ Handle State Change
    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        const selectedState = states.find(
            (s) => s.isoCode === stateCode
        );

        const cityList = City.getCitiesOfState(
            formData.countryCode,
            stateCode
        );

        setCities(cityList);

        setFormData({
            ...formData,
            state: selectedState.name,
            stateCode,
            city: "",
        });
    };

    // ✅ Handle City Change
    const handleCityChange = (e) => {
        setFormData({ ...formData, city: e.target.value });
    };

    // ✅ Image Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            setFormData({ ...formData, image: file });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Updated Data:", formData);
        onClose();
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-md font-semibold text-lg">
                    Edit Subadmin
                </div>

                <button
                    onClick={onClose}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-md text-sm font-medium transition"
                >
                    GO BACK
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Basic Fields */}
                {[
                    { label: "Name *", name: "name" },
                    { label: "Email *", name: "email" },
                    { label: "Password *", name: "password" },
                    { label: "Assigned Role *", name: "role" },
                    { label: "Phone *", name: "phone" },
                    { label: "Address *", name: "address" },
                ].map((field, index) => (
                    <div key={index}>
                        <label className="block text-sm text-gray-500 mb-2">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 text-gray-700 bg-transparent"
                            required
                        />
                    </div>
                ))}

                {/* Country Dropdown */}
                <div>
                    <label className="block text-sm text-gray-500 mb-2">
                        Country *
                    </label>
                    <select
                        value={formData.countryCode}
                        onChange={handleCountryChange}
                        className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent"
                        required
                    >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* State Dropdown */}
                <div>
                    <label className="block text-sm text-gray-500 mb-2">
                        State *
                    </label>
                    <select
                        value={formData.stateCode}
                        onChange={handleStateChange}
                        className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent"
                        required
                    >
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City Dropdown */}
                <div>
                    <label className="block text-sm text-gray-500 mb-2">
                        City *
                    </label>
                    <select
                        value={formData.city}
                        onChange={handleCityChange}
                        className="w-full border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-2 bg-transparent"
                        required
                    >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city.name}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                        Update Profile Image
                    </h3>

                    <div className="flex items-center gap-8">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-36 h-36 rounded-xl object-cover border"
                            />
                        ) : (
                            <div className="w-36 h-36 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}

                        <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-md text-sm font-medium transition">
                            Change Image
                            <input type="file" hidden onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-8">
                    <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-3 rounded-lg shadow-md font-semibold transition"
                    >
                        Submit Details
                    </button>
                </div>

            </form>
        </div>
    );
}

export default EditSubadmin;
