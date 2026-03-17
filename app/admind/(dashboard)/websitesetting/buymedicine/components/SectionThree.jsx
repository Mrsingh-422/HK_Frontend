"use client";
import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaCloudUploadAlt, FaImage } from "react-icons/fa";

function DeclarePastAdmin() {
    const { saveDeclarePastContent } = useAdminContext();
    const { getDeclarePastContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subtitle: "Take Care Also",
        buttonText: "Buy Online Medicine",
        images: [] 
    });

    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await getDeclarePastContent();
            if (res?.data) {
                setFormData({
                    title: res.data.title || "",
                    description: res.data.description || "",
                    subtitle: res.data.subtitle || "Take Care Also",
                    buttonText: res.data.buttonText || "Buy Online Medicine",
                    images: []
                });
                const imageUrls = (res.data.images || []).map(img => 
                    img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_BACKEND_URL}${img}`
                );
                setPreviews(imageUrls);
            }
        } catch (err) { console.log(err); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("subtitle", formData.subtitle);
        data.append("buttonText", formData.buttonText);
        formData.images.forEach(img => data.append("images", img));

        try {
            await saveDeclarePastContent(data);
            setSuccess("Content updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
            fetchContent();
        } catch (err) {
            setError("Failed to save content.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">Manage 'Declare The Past' Section</h2>
                
                {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Main Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="p-3 border rounded-lg" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Subtitle Tag</label>
                            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="p-3 border rounded-lg" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Quote/Description</label>
                        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="p-3 border rounded-lg" required />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Button Text</label>
                        <input type="text" name="buttonText" value={formData.buttonText} onChange={handleChange} className="p-3 border rounded-lg" />
                    </div>

                    <div className="p-6 border-2 border-dashed rounded-xl bg-gray-50">
                        <div className="flex flex-col items-center">
                            <FaCloudUploadAlt size={30} className="text-gray-400" />
                            <input type="file" multiple onChange={handleImages} className="mt-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {previews.map((src, i) => (
                                <img key={i} src={src} className="h-20 w-20 object-cover rounded-lg border" />
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold">
                        {loading ? "Saving..." : "Update Section"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DeclarePastAdmin;