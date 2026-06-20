"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FaArrowLeft, FaStar, FaRegCommentDots, FaUserCircle
} from "react-icons/fa";
import { HiStar } from "react-icons/hi";
import { FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import UserAPI from "@/app/services/UserAPI";

function ReviewsListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const targetType = searchParams.get("targetType") || "Lab";
    const targetId = searchParams.get("targetId");

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalCount: 0,
        limit: 25
    });

    const fetchReviews = async (pageNumber) => {
        if (!targetId) return;
        setLoading(true);
        try {
            const response = await UserAPI.getUniversalReviews(targetType, targetId, pageNumber);
            if (response.success) {
                setReviews(response.data || []);
                setPagination({
                    totalPages: response.totalPages || 1,
                    totalCount: response.total || 0,
                    limit: response.limit || 25
                });
                setCurrentPage(response.currentPage || pageNumber);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetId) {
            fetchReviews(1);
        }
    }, [targetId, targetType]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchReviews(newPage);
            // Smooth scroll back to top of review list container
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (!targetId) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-slate-500 font-medium bg-[#F8FAFC]">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FaRegCommentDots className="text-slate-300 text-3xl" />
                </div>
                <p className="text-lg font-bold text-slate-800">Invalid Review request</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
            {/* --- NAVIGATION BAR --- */}
            <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-all"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                            Verified Ratings
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- HERO / SUMMARY CONTAINER --- */}
            <header className="bg-white border-b border-slate-200 py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                                {targetType} Experience
                            </span>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mt-4 uppercase">
                                Patient Reviews & Feedback
                            </h1>
                            <p className="text-slate-500 font-semibold text-sm mt-2">
                                Showing completed transparent feedback and star ratings submitted by our verified community.
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-4 text-center shrink-0 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Reviews</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{pagination.totalCount}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- REVIEWS LIST --- */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-[2rem] shadow-xs">
                        <FiRefreshCw className="animate-spin text-emerald-600" size={26} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center shadow-xs">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <FaRegCommentDots className="text-slate-300 text-xl" />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-wider">No Reviews Yet</h3>
                        <p className="text-slate-500 font-medium text-xs max-w-sm mx-auto mt-2">
                            There are currently no patient experience ratings or comment details documented for this {targetType.toLowerCase()}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Feed Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {reviews.map((rev) => (
                                <div
                                    key={rev._id}
                                    className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-xs hover:border-slate-300 transition-all space-y-4"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                                <FaUserCircle size={22} className="opacity-65" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-none">{rev.userName || "Anonymous Patient"}</p>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wide block mt-1">
                                                    Submitted: {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1 shrink-0">
                                            <FaStar size={11} className="text-amber-500" />
                                            <span>{rev.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-0.5 px-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <HiStar
                                                key={star}
                                                size={18}
                                                className={star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-slate-700 text-xs font-semibold leading-relaxed pl-1 italic">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Bar */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-4 flex items-center justify-between shadow-xs">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                                    Page {currentPage} of {pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 disabled:opacity-30 transition-all"
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={currentPage >= pagination.totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 disabled:opacity-30 transition-all"
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// Loading Skeleton
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="h-16 bg-white border-b border-slate-200" />
        <div className="bg-white border-b border-slate-200 py-12">
            <div className="max-w-4xl mx-auto px-6 space-y-4">
                <div className="h-6 w-24 bg-slate-200 rounded-lg" />
                <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
            </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 mt-10 space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-[2rem] border border-slate-200" />
            ))}
        </div>
    </div>
);

// Wrapper for safe Suspense boundary handling
export default function Page() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ReviewsListContent />
        </Suspense>
    );
}