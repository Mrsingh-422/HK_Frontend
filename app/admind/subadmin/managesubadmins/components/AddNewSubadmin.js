"use client";

import React, { useState } from "react";
import { Country, State, City } from "country-state-city";

function AddNewSubadmin() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "",
        country: "",
        state: "",
        city: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);

    const countries = Country.getAllCountries();
    const states = State.getStatesOfCountry(formData.country);
    const cities = City.getCitiesOfState(formData.country, formData.state);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        alert("Subadmin Added Successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Add New Subadmin
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name */}
                    <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-sm text-gray-600">Assigned Role</label>
                        <select
                            name="role"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Select Role</option>
                            <option value="Manager">Manager</option>
                            <option value="Editor">Editor</option>
                            <option value="Testing">Testing</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>

                    {/* Country */}
                    <div>
                        <label className="text-sm text-gray-600">Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    country: e.target.value,
                                    state: "",
                                    city: "",
                                });
                            }}
                            required
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* State */}
                    <div>
                        <label className="text-sm text-gray-600">State</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={(e) =>
                                setFormData({ ...formData, state: e.target.value, city: "" })
                            }
                            required
                            disabled={!formData.country}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Select State</option>
                            {states.map((state) => (
                                <option key={state.isoCode} value={state.isoCode}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* City */}
                    <div>
                        <label className="text-sm text-gray-600">City</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            disabled={!formData.state}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <input
                            type="text"
                            name="address"
                            required
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="w-full mt-1 p-2 border rounded-lg"
                        />

                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-4 w-32 h-32 object-cover rounded-lg border"
                            />
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg shadow-md transition"
                        >
                            Add Subadmin
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddNewSubadmin;