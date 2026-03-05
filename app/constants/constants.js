// constants.js
export const INITIAL_MEDICINES = [
  {
    id: 1,
    name: "Invokana 100mg Tablet",
    vendor: "Johnson & Johnson Ltd",
    actualPrice: 545,
    discountPrice: 463,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",

    introduction: "Invokana 100mg Tablet is used to control high blood sugar levels in patients with type 2 diabetes.",
    description: "It works by helping the kidneys remove excess glucose from the bloodstream through urine.",
    useOfMedicine: ["Type 2 Diabetes", "Blood sugar control"],
    drugCategory: "SGLT2 Inhibitor",
    sideEffects: ["Frequent urination", "Dehydration", "Dizziness", "Urinary tract infection"],
    safetyAdvice: "Use with caution in kidney disease patients. Avoid excessive alcohol consumption.",
    saltComposition: "Canagliflozin 100mg",
    primaryUse: "Treatment of Type 2 Diabetes Mellitus",
    saltSynonyms: ["Canagliflozin"],
    storage: "Store below 30°C in a dry place away from sunlight.",
    benefits: ["Improves blood sugar control", "Supports heart health", "May help in weight reduction"],
    howToUse: "Take once daily before the first meal of the day as prescribed by your doctor."
  },

  {
    id: 2,
    name: "Metformin 500mg Tablet",
    vendor: "Sun Pharma Ltd",
    actualPrice: 120,
    discountPrice: 95,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80",

    introduction: "Metformin 500mg is an oral anti-diabetic medicine.",
    description: "It lowers glucose production in the liver and improves insulin sensitivity.",
    useOfMedicine: ["Type 2 Diabetes", "PCOS"],
    drugCategory: "Biguanide",
    sideEffects: ["Nausea", "Diarrhea", "Abdominal pain"],
    safetyAdvice: "Avoid alcohol. Inform doctor if you have kidney or liver issues.",
    saltComposition: "Metformin Hydrochloride 500mg",
    primaryUse: "Control of blood sugar",
    saltSynonyms: ["Metformin HCl"],
    storage: "Store at room temperature.",
    benefits: ["Reduces blood glucose", "Improves insulin response"],
    howToUse: "Take with food to reduce stomach upset."
  },

  {
    id: 3,
    name: "Augmentin 625mg Tablet",
    vendor: "GlaxoSmithKline",
    actualPrice: 210,
    discountPrice: 185,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",

    introduction: "Augmentin is an antibiotic used to treat bacterial infections.",
    description: "It contains Amoxicillin and Clavulanic Acid which fight bacteria.",
    useOfMedicine: ["Respiratory infection", "Urinary tract infection", "Skin infection"],
    drugCategory: "Penicillin Antibiotic",
    sideEffects: ["Diarrhea", "Rash", "Nausea"],
    safetyAdvice: "Complete the full course. Avoid if allergic to penicillin.",
    saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
    primaryUse: "Bacterial infections",
    saltSynonyms: ["Co-amoxiclav"],
    storage: "Store below 25°C.",
    benefits: ["Effective against resistant bacteria"],
    howToUse: "Take after meals with water."
  },

  {
    id: 4,
    name: "Dolo 650 Tablet",
    vendor: "Micro Labs Ltd",
    actualPrice: 35,
    discountPrice: 30,
    image: "https://images.unsplash.com/photo-1588776814546-ec7e2b57c2d6?auto=format&fit=crop&w=400&q=80",

    introduction: "Dolo 650 is used to relieve pain and fever.",
    description: "It contains Paracetamol which reduces fever and mild to moderate pain.",
    useOfMedicine: ["Fever", "Headache", "Body pain"],
    drugCategory: "Analgesic & Antipyretic",
    sideEffects: ["Allergic reaction (rare)", "Liver damage (overdose)"],
    safetyAdvice: "Do not exceed recommended dose.",
    saltComposition: "Paracetamol 650mg",
    primaryUse: "Pain and fever relief",
    saltSynonyms: ["Acetaminophen"],
    storage: "Keep in a cool dry place.",
    benefits: ["Quick fever reduction", "Safe when used correctly"],
    howToUse: "Take after food with water."
  },

  {
    id: 5,
    name: "Amlodipine 5mg Tablet",
    vendor: "Cipla Ltd",
    actualPrice: 90,
    discountPrice: 72,
    image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",

    introduction: "Amlodipine is used to treat high blood pressure.",
    description: "It relaxes blood vessels and improves blood flow.",
    useOfMedicine: ["Hypertension", "Angina"],
    drugCategory: "Calcium Channel Blocker",
    sideEffects: ["Swelling of ankles", "Headache", "Dizziness"],
    safetyAdvice: "Monitor blood pressure regularly.",
    saltComposition: "Amlodipine 5mg",
    primaryUse: "High blood pressure treatment",
    saltSynonyms: ["Amlodipine Besylate"],
    storage: "Store below 30°C.",
    benefits: ["Prevents heart attack & stroke risk"],
    howToUse: "Take once daily at the same time."
  },

  // 6 to 15 (Shortened for space but complete structure)

  {
    id: 6,
    name: "Atorvastatin 10mg",
    vendor: "Dr Reddy's Labs",
    actualPrice: 150,
    discountPrice: 120,
    image: "https://images.unsplash.com/photo-1576765607924-3f0c2d6b7c10?auto=format&fit=crop&w=400&q=80",
    introduction: "Used to lower cholesterol levels.",
    description: "Reduces bad cholesterol and triglycerides.",
    useOfMedicine: ["High cholesterol"],
    drugCategory: "Statin",
    sideEffects: ["Muscle pain", "Nausea"],
    safetyAdvice: "Avoid grapefruit juice.",
    saltComposition: "Atorvastatin 10mg",
    primaryUse: "Cholesterol management",
    saltSynonyms: ["Atorva"],
    storage: "Room temperature.",
    benefits: ["Reduces heart disease risk"],
    howToUse: "Take once daily."
  },

  {
    id: 7,
    name: "Pantoprazole 40mg",
    vendor: "Lupin Ltd",
    actualPrice: 110,
    discountPrice: 85,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    introduction: "Used for acidity and GERD.",
    description: "Reduces stomach acid production.",
    useOfMedicine: ["Acidity", "GERD"],
    drugCategory: "Proton Pump Inhibitor",
    sideEffects: ["Headache", "Diarrhea"],
    safetyAdvice: "Take before food.",
    saltComposition: "Pantoprazole 40mg",
    primaryUse: "Acid reflux treatment",
    saltSynonyms: ["Pantoprazole Sodium"],
    storage: "Store below 25°C.",
    benefits: ["Relieves heartburn"],
    howToUse: "Take 30 minutes before breakfast."
  },

  {
    id: 8,
    name: "Levocetirizine 5mg",
    vendor: "Alkem Labs",
    actualPrice: 75,
    discountPrice: 60,
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80",
    introduction: "Anti-allergy medication.",
    description: "Relieves sneezing and runny nose.",
    useOfMedicine: ["Allergic rhinitis", "Skin allergy"],
    drugCategory: "Antihistamine",
    sideEffects: ["Drowsiness", "Dry mouth"],
    safetyAdvice: "Avoid driving after taking.",
    saltComposition: "Levocetirizine 5mg",
    primaryUse: "Allergy relief",
    saltSynonyms: ["Levocet"],
    storage: "Room temperature.",
    benefits: ["Fast allergy relief"],
    howToUse: "Take once daily in evening."
  },

  {
    id: 9,
    name: "Azithromycin 500mg",
    vendor: "Pfizer Ltd",
    actualPrice: 180,
    discountPrice: 150,
    image: "https://images.unsplash.com/photo-1581595219341-7a5d2e0b8c9e?auto=format&fit=crop&w=400&q=80",
    introduction: "Antibiotic for bacterial infections.",
    description: "Stops bacterial growth.",
    useOfMedicine: ["Respiratory infection", "Skin infection"],
    drugCategory: "Macrolide Antibiotic",
    sideEffects: ["Nausea", "Abdominal pain"],
    safetyAdvice: "Complete full course.",
    saltComposition: "Azithromycin 500mg",
    primaryUse: "Bacterial infection treatment",
    saltSynonyms: ["Azi"],
    storage: "Store below 30°C.",
    benefits: ["Effective short course antibiotic"],
    howToUse: "Take once daily before food."
  },

  {
    id: 10,
    name: "Montelukast 10mg",
    vendor: "Cipla Ltd",
    actualPrice: 140,
    discountPrice: 110,
    image: "https://images.unsplash.com/photo-1588776814546-ec7e2b57c2d6?auto=format&fit=crop&w=400&q=80",
    introduction: "Used for asthma and allergies.",
    description: "Reduces airway inflammation.",
    useOfMedicine: ["Asthma", "Allergy"],
    drugCategory: "Leukotriene Receptor Antagonist",
    sideEffects: ["Headache", "Mood changes"],
    safetyAdvice: "Take at night.",
    saltComposition: "Montelukast 10mg",
    primaryUse: "Asthma prevention",
    saltSynonyms: ["Montair"],
    storage: "Room temperature.",
    benefits: ["Prevents asthma attacks"],
    howToUse: "Take once daily."
  },

  {
    id: 11,
    name: "Losartan 50mg",
    vendor: "Sun Pharma",
    actualPrice: 130,
    discountPrice: 100,
    image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
    introduction: "Treats high blood pressure.",
    description: "Relaxes blood vessels.",
    useOfMedicine: ["Hypertension"],
    drugCategory: "ARB",
    sideEffects: ["Dizziness"],
    safetyAdvice: "Monitor BP regularly.",
    saltComposition: "Losartan 50mg",
    primaryUse: "Blood pressure control",
    saltSynonyms: ["Losar"],
    storage: "Below 30°C.",
    benefits: ["Prevents stroke risk"],
    howToUse: "Take once daily."
  },

  {
    id: 12,
    name: "Glimepiride 2mg",
    vendor: "Torrent Pharma",
    actualPrice: 85,
    discountPrice: 65,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    introduction: "Oral anti-diabetic drug.",
    description: "Stimulates insulin release.",
    useOfMedicine: ["Type 2 Diabetes"],
    drugCategory: "Sulfonylurea",
    sideEffects: ["Low blood sugar"],
    safetyAdvice: "Eat properly after taking.",
    saltComposition: "Glimepiride 2mg",
    primaryUse: "Blood sugar control",
    saltSynonyms: ["Amaryl"],
    storage: "Room temperature.",
    benefits: ["Controls post-meal sugar"],
    howToUse: "Take before breakfast."
  },

  {
    id: 13,
    name: "Cetirizine 10mg",
    vendor: "Zydus Cadila",
    actualPrice: 50,
    discountPrice: 40,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80",
    introduction: "Allergy relief tablet.",
    description: "Blocks histamine effects.",
    useOfMedicine: ["Allergy"],
    drugCategory: "Antihistamine",
    sideEffects: ["Drowsiness"],
    safetyAdvice: "Avoid driving.",
    saltComposition: "Cetirizine 10mg",
    primaryUse: "Allergy treatment",
    saltSynonyms: ["Cetzine"],
    storage: "Room temperature.",
    benefits: ["Reduces sneezing"],
    howToUse: "Take once daily."
  },

  {
    id: 14,
    name: "Clopidogrel 75mg",
    vendor: "Intas Pharma",
    actualPrice: 160,
    discountPrice: 135,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    introduction: "Prevents blood clots.",
    description: "Prevents platelets from sticking together.",
    useOfMedicine: ["Heart attack prevention"],
    drugCategory: "Antiplatelet",
    sideEffects: ["Bleeding"],
    safetyAdvice: "Avoid injury.",
    saltComposition: "Clopidogrel 75mg",
    primaryUse: "Clot prevention",
    saltSynonyms: ["Clopilet"],
    storage: "Below 30°C.",
    benefits: ["Reduces stroke risk"],
    howToUse: "Take once daily."
  },

  {
    id: 15,
    name: "Rabeprazole 20mg",
    vendor: "Cadila Healthcare",
    actualPrice: 125,
    discountPrice: 98,
    image: "https://images.unsplash.com/photo-1576765607924-3f0c2d6b7c10?auto=format&fit=crop&w=400&q=80",
    introduction: "Treats acidity and ulcers.",
    description: "Reduces stomach acid.",
    useOfMedicine: ["Acidity", "Ulcer"],
    drugCategory: "Proton Pump Inhibitor",
    sideEffects: ["Headache"],
    safetyAdvice: "Take before meals.",
    saltComposition: "Rabeprazole 20mg",
    primaryUse: "Acid control",
    saltSynonyms: ["Rablet"],
    storage: "Room temperature.",
    benefits: ["Relieves heartburn"],
    howToUse: "Take before breakfast."
  }
];

export const DOCTORS_DATA = [
  {
    id: 1,
    name: "Dr. Abhi",
    specialty: "Heart Specialist",
    category: "Cardiology",
    experience: "3 Years",
    qualification: "MBBS, MD (Cardiology)",
    hospital: "Fortis Heart Institute",
    registrationNumber: "PMC/2019/45821",
    speaks: ["English", "Hindi", "Punjabi"],
    address: "Mohali, Punjab",
    clinicAddress: "Fortis Hospital, Sector 62, Mohali, Punjab",
    distance: 8.5,
    rating: 4.3,
    totalReviews: 214,
    consultFee: 3000,
    clinicFee: 2500,
    videoConsultFee: 2000,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
    about: "Dr. Abhi is a skilled cardiologist specializing in preventive cardiology and heart failure management.",
    services: ["Heart Checkup", "ECG", "Angiography Consultation", "Blood Pressure Management", "Cholesterol Management"],
    conditionsTreated: ["Coronary Artery Disease", "Heart Failure", "High Blood Pressure", "Arrhythmia", "High Cholesterol"],
    education: [
      { degree: "MBBS", institute: "AIIMS Delhi", year: "2018" },
      { degree: "MD Cardiology", institute: "PGIMER Chandigarh", year: "2022" }
    ],
    availability: {
      clinicDays: ["Monday", "Wednesday", "Friday"],
      clinicTiming: "10:00 AM - 3:00 PM",
      videoConsultation: "Daily 6:00 PM - 9:00 PM"
    },
    awards: ["Best Young Cardiologist Award 2023"],
    reviews: [
      { patient: "Rahul Sharma", rating: 5, comment: "Very professional doctor.", date: "2025-12-12" }
    ]
  },

  {
    id: 2,
    name: "Dr. Riya Sharma",
    specialty: "Dermatologist",
    category: "Dermatology",
    experience: "6 Years",
    qualification: "MBBS, MD Dermatology",
    hospital: "Apollo Skin Center",
    registrationNumber: "DMC/2017/9921",
    speaks: ["English", "Hindi"],
    address: "Delhi, India",
    clinicAddress: "Apollo Clinic, South Delhi",
    distance: 3.2,
    rating: 4.6,
    totalReviews: 320,
    consultFee: 2200,
    clinicFee: 1800,
    videoConsultFee: 1500,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    about: "Experienced dermatologist treating acne, pigmentation and skin allergies.",
    services: ["Acne Treatment", "Skin Allergy Treatment", "Laser Skin Therapy", "Anti Aging Treatment"],
    conditionsTreated: ["Acne", "Psoriasis", "Skin Allergy", "Pigmentation"],
    education: [
      { degree: "MBBS", institute: "Delhi University", year: "2015" },
      { degree: "MD Dermatology", institute: "AIIMS Delhi", year: "2019" }
    ],
    availability: {
      clinicDays: ["Tuesday", "Thursday", "Saturday"],
      clinicTiming: "11:00 AM - 4:00 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Best Dermatologist Delhi 2022"],
    reviews: [
      { patient: "Sneha Kapoor", rating: 5, comment: "Helped my acne problem.", date: "2025-10-02" }
    ]
  },

  {
    id: 3,
    name: "Dr. Karan Mehta",
    specialty: "Orthopedic Surgeon",
    category: "Orthopedics",
    experience: "8 Years",
    qualification: "MBBS, MS Orthopedics",
    hospital: "Max Super Specialty Hospital",
    registrationNumber: "PMC/2016/8821",
    speaks: ["English", "Hindi"],
    address: "Chandigarh, Punjab",
    clinicAddress: "Max Hospital, Chandigarh",
    distance: 5.6,
    rating: 4.5,
    totalReviews: 280,
    consultFee: 2600,
    clinicFee: 2000,
    videoConsultFee: 1700,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    about: "Orthopedic surgeon specializing in joint replacement and sports injuries.",
    services: ["Joint Replacement", "Fracture Treatment", "Arthroscopy", "Sports Injury Treatment"],
    conditionsTreated: ["Knee Pain", "Fractures", "Arthritis", "Back Pain"],
    education: [
      { degree: "MBBS", institute: "PGIMER Chandigarh", year: "2014" },
      { degree: "MS Orthopedics", institute: "AIIMS Delhi", year: "2018" }
    ],
    availability: {
      clinicDays: ["Monday", "Thursday", "Saturday"],
      clinicTiming: "9:00 AM - 1:00 PM",
      videoConsultation: "Daily 6:00 PM - 8:00 PM"
    },
    awards: ["Best Orthopedic Surgeon Punjab 2023"],
    reviews: [
      { patient: "Amit Kumar", rating: 5, comment: "Great treatment for my knee pain.", date: "2025-08-15" }
    ]
  },

  {
    id: 4,
    name: "Dr. Neha Kapoor",
    specialty: "Gynecologist",
    category: "Gynecology",
    experience: "7 Years",
    qualification: "MBBS, MD Gynecology",
    hospital: "Cloudnine Hospital",
    registrationNumber: "DMC/2018/7721",
    speaks: ["English", "Hindi"],
    address: "Noida, UP",
    clinicAddress: "Cloudnine Hospital, Noida",
    distance: 4.4,
    rating: 4.7,
    totalReviews: 340,
    consultFee: 2500,
    clinicFee: 2100,
    videoConsultFee: 1800,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
    about: "Specialist in pregnancy care, infertility treatment and women's health.",
    services: ["Pregnancy Care", "Infertility Treatment", "Menstrual Disorders"],
    conditionsTreated: ["PCOS", "Infertility", "Pregnancy Complications"],
    education: [
      { degree: "MBBS", institute: "King George Medical University", year: "2015" },
      { degree: "MD Gynecology", institute: "AIIMS Delhi", year: "2019" }
    ],
    availability: {
      clinicDays: ["Monday", "Wednesday", "Friday"],
      clinicTiming: "10:30 AM - 2:30 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Top Gynecologist Noida 2024"],
    reviews: [
      { patient: "Ritika Jain", rating: 5, comment: "Very caring doctor.", date: "2025-11-18" }
    ]
  },

  {
    id: 5,
    name: "Dr. Arjun Singh",
    specialty: "Neurologist",
    category: "Neurology",
    experience: "10 Years",
    qualification: "MBBS, DM Neurology",
    hospital: "Medanta Hospital",
    registrationNumber: "PMC/2015/7722",
    speaks: ["English", "Hindi"],
    address: "Gurgaon, Haryana",
    clinicAddress: "Medanta Medicity, Gurgaon",
    distance: 6.1,
    rating: 4.8,
    totalReviews: 410,
    consultFee: 3500,
    clinicFee: 3000,
    videoConsultFee: 2500,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    about: "Neurologist specializing in epilepsy, stroke and migraine treatment.",
    services: ["Stroke Treatment", "Migraine Management", "EEG Test"],
    conditionsTreated: ["Epilepsy", "Stroke", "Migraine"],
    education: [
      { degree: "MBBS", institute: "AIIMS Delhi", year: "2012" },
      { degree: "DM Neurology", institute: "PGIMER Chandigarh", year: "2016" }
    ],
    availability: {
      clinicDays: ["Tuesday", "Thursday", "Saturday"],
      clinicTiming: "11:00 AM - 3:00 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Best Neurologist India 2022"],
    reviews: [
      { patient: "Manoj Verma", rating: 5, comment: "Excellent doctor.", date: "2025-09-02" }
    ]
  },

  {
    id: 6,
    name: "Dr. Priya Verma",
    specialty: "Pediatrician",
    category: "Pediatrics",
    experience: "5 Years",
    qualification: "MBBS, MD Pediatrics",
    hospital: "Rainbow Children's Hospital",
    registrationNumber: "PMC/2020/5542",
    speaks: ["English", "Hindi"],
    address: "Ludhiana, Punjab",
    clinicAddress: "Rainbow Children's Clinic, Ludhiana",
    distance: 6.3,
    rating: 4.4,
    totalReviews: 190,
    consultFee: 1800,
    clinicFee: 1500,
    videoConsultFee: 1200,
    image: "https://images.unsplash.com/photo-1594824475525-1c90a2d8f6d2?auto=format&fit=crop&w=400&q=80",
    about: "Child specialist focused on newborn and pediatric care.",
    services: ["Child Vaccination", "Newborn Care", "Growth Monitoring"],
    conditionsTreated: ["Fever in Children", "Allergies", "Nutrition Issues"],
    education: [
      { degree: "MBBS", institute: "Punjab University", year: "2016" },
      { degree: "MD Pediatrics", institute: "AIIMS Delhi", year: "2020" }
    ],
    availability: {
      clinicDays: ["Monday", "Wednesday", "Saturday"],
      clinicTiming: "10:00 AM - 1:00 PM",
      videoConsultation: "Daily 6:00 PM - 8:00 PM"
    },
    awards: ["Young Pediatrician Award 2023"],
    reviews: [
      { patient: "Pooja Sharma", rating: 4, comment: "Very good with kids.", date: "2025-10-10" }
    ]
  },

  {
    id: 7,
    name: "Dr. Rahul Khanna",
    specialty: "ENT Specialist",
    category: "ENT",
    experience: "9 Years",
    qualification: "MBBS, MS ENT",
    hospital: "BLK Hospital",
    registrationNumber: "DMC/2016/6612",
    speaks: ["English", "Hindi"],
    address: "Delhi, India",
    clinicAddress: "BLK Super Specialty Hospital",
    distance: 7.5,
    rating: 4.4,
    totalReviews: 205,
    consultFee: 2000,
    clinicFee: 1700,
    videoConsultFee: 1400,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",
    about: "ENT specialist treating sinus, ear infections and throat issues.",
    services: ["Sinus Treatment", "Hearing Test", "Throat Infection Treatment"],
    conditionsTreated: ["Sinusitis", "Ear Infection", "Tonsillitis"],
    education: [
      { degree: "MBBS", institute: "Delhi University", year: "2013" },
      { degree: "MS ENT", institute: "AIIMS Delhi", year: "2017" }
    ],
    availability: {
      clinicDays: ["Monday", "Thursday", "Saturday"],
      clinicTiming: "12:00 PM - 4:00 PM",
      videoConsultation: "Daily 8:00 PM - 9:30 PM"
    },
    awards: ["Best ENT Doctor Delhi 2023"],
    reviews: [
      { patient: "Vikas Jain", rating: 5, comment: "Solved my sinus issue.", date: "2025-07-01" }
    ]
  },

  {
    id: 8,
    name: "Dr. Sneha Patel",
    specialty: "Dentist",
    category: "Dental",
    experience: "4 Years",
    qualification: "BDS, MDS",
    hospital: "Smile Dental Clinic",
    registrationNumber: "GDC/2021/2211",
    speaks: ["English", "Hindi", "Gujarati"],
    address: "Ahmedabad, Gujarat",
    clinicAddress: "Smile Dental Care, Ahmedabad",
    distance: 2.8,
    rating: 4.7,
    totalReviews: 170,
    consultFee: 1500,
    clinicFee: 1200,
    videoConsultFee: 1000,
    image: "https://images.unsplash.com/photo-1606813909355-2065a9e1b8a5?auto=format&fit=crop&w=400&q=80",
    about: "Dentist specializing in cosmetic and restorative dentistry.",
    services: ["Teeth Cleaning", "Root Canal", "Teeth Whitening"],
    conditionsTreated: ["Tooth Decay", "Gum Disease", "Tooth Pain"],
    education: [
      { degree: "BDS", institute: "Gujarat University", year: "2018" },
      { degree: "MDS", institute: "Manipal University", year: "2021" }
    ],
    availability: {
      clinicDays: ["Monday", "Tuesday", "Friday"],
      clinicTiming: "9:00 AM - 1:00 PM",
      videoConsultation: "Daily 6:00 PM - 8:00 PM"
    },
    awards: ["Best Dentist Ahmedabad 2024"],
    reviews: [
      { patient: "Ramesh Shah", rating: 5, comment: "Very gentle dentist.", date: "2025-05-22" }
    ]
  },
  {
    id: 9,
    name: "Dr. Aman Gupta",
    specialty: "General Physician",
    category: "General Medicine",
    experience: "7 Years",
    qualification: "MBBS, MD General Medicine",
    hospital: "Apollo Hospital",
    registrationNumber: "PMC/2017/3342",
    speaks: ["English", "Hindi"],
    address: "Delhi, India",
    clinicAddress: "Apollo Clinic, Karol Bagh, Delhi",
    distance: 3.9,
    rating: 4.5,
    totalReviews: 190,
    consultFee: 2000,
    clinicFee: 1700,
    videoConsultFee: 1400,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    about: "Experienced general physician treating common illnesses, infections and lifestyle diseases.",
    services: ["General Checkup", "Fever Treatment", "Diabetes Management", "Hypertension Treatment"],
    conditionsTreated: ["Fever", "Diabetes", "Blood Pressure", "Infections"],
    education: [
      { degree: "MBBS", institute: "Delhi University", year: "2014" },
      { degree: "MD General Medicine", institute: "AIIMS Delhi", year: "2018" }
    ],
    availability: {
      clinicDays: ["Monday", "Tuesday", "Thursday"],
      clinicTiming: "10:00 AM - 2:00 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Best Physician Delhi 2023"],
    reviews: [
      { patient: "Sanjay Mehta", rating: 5, comment: "Very helpful doctor.", date: "2025-08-14" }
    ]
  },

  {
    id: 10,
    name: "Dr. Kavita Sharma",
    specialty: "Psychiatrist",
    category: "Mental Health",
    experience: "9 Years",
    qualification: "MBBS, MD Psychiatry",
    hospital: "MindCare Clinic",
    registrationNumber: "DMC/2016/8841",
    speaks: ["English", "Hindi"],
    address: "Noida, UP",
    clinicAddress: "MindCare Mental Health Clinic, Noida",
    distance: 4.7,
    rating: 4.6,
    totalReviews: 210,
    consultFee: 2600,
    clinicFee: 2200,
    videoConsultFee: 2000,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
    about: "Psychiatrist specializing in anxiety, depression and stress management.",
    services: ["Mental Health Consultation", "Anxiety Treatment", "Depression Therapy"],
    conditionsTreated: ["Depression", "Anxiety", "Panic Disorder", "Stress"],
    education: [
      { degree: "MBBS", institute: "King George Medical University", year: "2012" },
      { degree: "MD Psychiatry", institute: "AIIMS Delhi", year: "2016" }
    ],
    availability: {
      clinicDays: ["Wednesday", "Friday", "Saturday"],
      clinicTiming: "11:00 AM - 3:00 PM",
      videoConsultation: "Daily 6:00 PM - 9:00 PM"
    },
    awards: ["Mental Health Excellence Award 2022"],
    reviews: [
      { patient: "Anjali Verma", rating: 5, comment: "Very supportive doctor.", date: "2025-09-21" }
    ]
  },

  {
    id: 11,
    name: "Dr. Rohit Bansal",
    specialty: "Urologist",
    category: "Urology",
    experience: "11 Years",
    qualification: "MBBS, MS Urology",
    hospital: "Medanta Hospital",
    registrationNumber: "PMC/2014/9911",
    speaks: ["English", "Hindi"],
    address: "Gurgaon, Haryana",
    clinicAddress: "Medanta Medicity, Gurgaon",
    distance: 6.2,
    rating: 4.7,
    totalReviews: 260,
    consultFee: 3200,
    clinicFee: 2800,
    videoConsultFee: 2500,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    about: "Experienced urologist treating kidney stones and urinary tract disorders.",
    services: ["Kidney Stone Treatment", "Prostate Treatment", "Urinary Infection Treatment"],
    conditionsTreated: ["Kidney Stones", "UTI", "Prostate Enlargement"],
    education: [
      { degree: "MBBS", institute: "PGIMER Chandigarh", year: "2011" },
      { degree: "MS Urology", institute: "AIIMS Delhi", year: "2015" }
    ],
    availability: {
      clinicDays: ["Monday", "Thursday"],
      clinicTiming: "12:00 PM - 4:00 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Top Urologist Haryana 2024"],
    reviews: [
      { patient: "Rakesh Yadav", rating: 5, comment: "Solved my kidney stone issue.", date: "2025-06-10" }
    ]
  },

  {
    id: 12,
    name: "Dr. Pooja Malhotra",
    specialty: "Ophthalmologist",
    category: "Eye Specialist",
    experience: "8 Years",
    qualification: "MBBS, MS Ophthalmology",
    hospital: "Vision Eye Center",
    registrationNumber: "DMC/2016/7711",
    speaks: ["English", "Hindi"],
    address: "Chandigarh, Punjab",
    clinicAddress: "Vision Eye Center, Chandigarh",
    distance: 5.4,
    rating: 4.6,
    totalReviews: 230,
    consultFee: 2100,
    clinicFee: 1800,
    videoConsultFee: 1500,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    about: "Eye specialist experienced in cataract surgery and vision correction.",
    services: ["Eye Checkup", "Cataract Surgery", "Vision Correction"],
    conditionsTreated: ["Cataract", "Glaucoma", "Dry Eyes"],
    education: [
      { degree: "MBBS", institute: "Punjab University", year: "2013" },
      { degree: "MS Ophthalmology", institute: "AIIMS Delhi", year: "2017" }
    ],
    availability: {
      clinicDays: ["Tuesday", "Friday"],
      clinicTiming: "10:00 AM - 2:00 PM",
      videoConsultation: "Daily 7:00 PM - 8:30 PM"
    },
    awards: ["Best Eye Surgeon Chandigarh 2023"],
    reviews: [
      { patient: "Sunita Sharma", rating: 4, comment: "Very experienced doctor.", date: "2025-07-15" }
    ]
  },

  {
    id: 13,
    name: "Dr. Vikram Sethi",
    specialty: "Gastroenterologist",
    category: "Gastroenterology",
    experience: "12 Years",
    qualification: "MBBS, DM Gastroenterology",
    hospital: "Max Super Specialty Hospital",
    registrationNumber: "PMC/2012/6644",
    speaks: ["English", "Hindi"],
    address: "Delhi, India",
    clinicAddress: "Max Hospital, Saket, Delhi",
    distance: 4.1,
    rating: 4.8,
    totalReviews: 310,
    consultFee: 3400,
    clinicFee: 3000,
    videoConsultFee: 2600,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",
    about: "Gastroenterologist specializing in digestive system disorders.",
    services: ["Endoscopy", "Acidity Treatment", "Liver Disease Treatment"],
    conditionsTreated: ["Acidity", "Liver Disease", "Ulcers"],
    education: [
      { degree: "MBBS", institute: "AIIMS Delhi", year: "2010" },
      { degree: "DM Gastroenterology", institute: "PGIMER Chandigarh", year: "2014" }
    ],
    availability: {
      clinicDays: ["Monday", "Wednesday", "Saturday"],
      clinicTiming: "11:00 AM - 3:00 PM",
      videoConsultation: "Daily 8:00 PM - 9:30 PM"
    },
    awards: ["Top Gastroenterologist India 2023"],
    reviews: [
      { patient: "Deepak Jain", rating: 5, comment: "Very knowledgeable doctor.", date: "2025-09-11" }
    ]
  },

  {
    id: 14,
    name: "Dr. Meera Nair",
    specialty: "Endocrinologist",
    category: "Endocrinology",
    experience: "10 Years",
    qualification: "MBBS, DM Endocrinology",
    hospital: "Apollo Hospital",
    registrationNumber: "KER/2015/9922",
    speaks: ["English", "Hindi", "Malayalam"],
    address: "Bangalore, India",
    clinicAddress: "Apollo Hospital, Bangalore",
    distance: 3.6,
    rating: 4.7,
    totalReviews: 245,
    consultFee: 3200,
    clinicFee: 2800,
    videoConsultFee: 2400,
    image: "https://images.unsplash.com/photo-1606813909355-2065a9e1b8a5?auto=format&fit=crop&w=400&q=80",
    about: "Endocrinologist treating diabetes, thyroid and hormone disorders.",
    services: ["Diabetes Management", "Thyroid Treatment", "Hormone Therapy"],
    conditionsTreated: ["Diabetes", "Thyroid Disorder", "Hormonal Imbalance"],
    education: [
      { degree: "MBBS", institute: "Kerala University", year: "2011" },
      { degree: "DM Endocrinology", institute: "AIIMS Delhi", year: "2015" }
    ],
    availability: {
      clinicDays: ["Monday", "Thursday", "Saturday"],
      clinicTiming: "9:30 AM - 1:30 PM",
      videoConsultation: "Daily 7:00 PM - 9:00 PM"
    },
    awards: ["Best Endocrinologist 2024"],
    reviews: [
      { patient: "Anita Nair", rating: 5, comment: "Excellent diabetes care.", date: "2025-10-05" }
    ]
  }

];

export const NURSES_DATA = [
  {
    id: 1,
    name: "Home Nursing Care",
    speciality: "General Nursing",
    experience: "5 Years",
    qualification: "GNM Nursing",
    hospital: "Apollo Home Care",
    price: 1150.99,
    rating: 4.2,
    totalReviews: 143,
    available: true,
    shift: "Day / Night",
    languages: ["English", "Hindi"],
    description: "Personalized attention. Feeding Tubes, Hoyer Lift, Catheter, Tracheotomy. We specialize in high needs residents.",
    services: ["Injection", "BP Monitoring", "Patient Hygiene", "Medication Support"],
    image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 2,
    name: "Elderly Care Nurse",
    speciality: "Geriatric Nursing",
    experience: "6 Years",
    qualification: "BSc Nursing",
    hospital: "Fortis Home Healthcare",
    price: 1299.99,
    rating: 4.5,
    totalReviews: 201,
    available: true,
    shift: "Day Shift",
    languages: ["English", "Hindi", "Punjabi"],
    description: "Specialized nursing care for elderly patients including mobility assistance and medication supervision.",
    services: ["Mobility Assistance", "BP Monitoring", "Medication Management", "Fall Prevention"],
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 3,
    name: "ICU Trained Nurse",
    speciality: "Critical Care",
    experience: "8 Years",
    qualification: "BSc Nursing, ICU Certification",
    hospital: "Max Healthcare",
    price: 1899.99,
    rating: 4.8,
    totalReviews: 167,
    available: true,
    shift: "24 Hour",
    languages: ["English", "Hindi"],
    description: "ICU trained nurses capable of handling ventilator patients and emergency situations.",
    services: ["Ventilator Support", "Emergency Monitoring", "IV Fluids", "Critical Care"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 4,
    name: "Post Surgery Care Nurse",
    speciality: "Post Operative Care",
    experience: "7 Years",
    qualification: "GNM Nursing",
    hospital: "Medanta Hospital",
    price: 1499.99,
    rating: 4.4,
    totalReviews: 112,
    available: true,
    shift: "Night Shift",
    languages: ["English", "Hindi"],
    description: "Professional care after surgery including wound care and medication supervision.",
    services: ["Wound Dressing", "Medication Support", "Pain Monitoring", "Patient Recovery Care"],
    image: "https://images.unsplash.com/photo-1580281657527-47b95d50f4b6?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 5,
    name: "Pediatric Home Nurse",
    speciality: "Child Care Nursing",
    experience: "4 Years",
    qualification: "BSc Nursing",
    hospital: "Rainbow Children's Hospital",
    price: 1199.99,
    rating: 4.3,
    totalReviews: 89,
    available: true,
    shift: "Day Shift",
    languages: ["English", "Hindi"],
    description: "Experienced pediatric nurse providing home care for infants and children.",
    services: ["Vaccination Support", "Baby Care", "Nutrition Monitoring", "Temperature Monitoring"],
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 6,
    name: "Diabetes Care Nurse",
    speciality: "Diabetic Care",
    experience: "5 Years",
    qualification: "GNM Nursing",
    hospital: "Apollo Sugar Clinics",
    price: 999.99,
    rating: 4.1,
    totalReviews: 75,
    available: true,
    shift: "Day Shift",
    languages: ["English", "Hindi"],
    description: "Specialized diabetes monitoring and insulin administration support.",
    services: ["Blood Sugar Monitoring", "Insulin Injection", "Diet Guidance", "Patient Monitoring"],
    image: "https://images.unsplash.com/photo-1584516150909-c43483ee7930?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 7,
    name: "Physiotherapy Assistant Nurse",
    speciality: "Rehabilitation Care",
    experience: "3 Years",
    qualification: "Diploma Nursing",
    hospital: "AIIMS Rehabilitation Center",
    price: 1050.50,
    rating: 4.0,
    totalReviews: 65,
    available: true,
    shift: "Day Shift",
    languages: ["English", "Hindi"],
    description: "Rehabilitation support nurse assisting physiotherapy exercises for patients recovering from injuries.",
    services: ["Mobility Assistance", "Exercise Support", "Patient Monitoring"],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 8,
    name: "Cancer Care Nurse",
    speciality: "Oncology Nursing",
    experience: "9 Years",
    qualification: "BSc Nursing, Oncology Certification",
    hospital: "Tata Memorial Hospital",
    price: 1999.99,
    rating: 4.7,
    totalReviews: 132,
    available: true,
    shift: "24 Hour",
    languages: ["English", "Hindi"],
    description: "Compassionate oncology nurse supporting cancer patients with treatment monitoring.",
    services: ["Chemotherapy Support", "Medication Monitoring", "Pain Management"],
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 9,
    name: "Stroke Recovery Nurse",
    speciality: "Neurological Care",
    experience: "6 Years",
    qualification: "GNM Nursing",
    hospital: "Fortis Neuro Center",
    price: 1399.99,
    rating: 4.4,
    totalReviews: 102,
    available: true,
    shift: "Day / Night",
    languages: ["English", "Hindi"],
    description: "Specialized support for stroke recovery patients including daily activity assistance.",
    services: ["Mobility Assistance", "Speech Therapy Support", "BP Monitoring"],
    image: "https://images.unsplash.com/photo-1580281780460-82d277d4e0e9?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 10,
    name: "Ventilator Support Nurse",
    speciality: "Respiratory Care",
    experience: "10 Years",
    qualification: "BSc Nursing",
    hospital: "Max Super Speciality Hospital",
    price: 2100.99,
    rating: 4.8,
    totalReviews: 154,
    available: true,
    shift: "24 Hour",
    languages: ["English", "Hindi"],
    description: "Expert nurse trained in ventilator and respiratory support for critical patients.",
    services: ["Ventilator Monitoring", "Oxygen Therapy", "Respiratory Monitoring"],
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 11,
    name: "Pregnancy Care Nurse",
    speciality: "Maternity Care",
    experience: "5 Years",
    qualification: "BSc Nursing",
    hospital: "Cloudnine Hospital",
    price: 1350.99,
    rating: 4.3,
    totalReviews: 91,
    available: true,
    shift: "Day Shift",
    languages: ["English", "Hindi"],
    description: "Professional maternity care for expecting mothers including monitoring and guidance.",
    services: ["Pregnancy Monitoring", "Nutrition Guidance", "Medication Support"],
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 12,
    name: "Home Injection Nurse",
    speciality: "Injection & IV Care",
    experience: "4 Years",
    qualification: "GNM Nursing",
    hospital: "Apollo Clinics",
    price: 850.99,
    rating: 4.1,
    totalReviews: 54,
    available: true,
    shift: "Flexible",
    languages: ["English", "Hindi"],
    description: "Home visit nurse for injections, IV drips, and medical procedures.",
    services: ["Injection", "IV Drip", "BP Monitoring"],
    image: "https://images.unsplash.com/photo-1576765608598-0735df749e43?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 13,
    name: "Bedridden Patient Care Nurse",
    speciality: "Long Term Care",
    experience: "7 Years",
    qualification: "GNM Nursing",
    hospital: "Care24 Home Healthcare",
    price: 1550.99,
    rating: 4.5,
    totalReviews: 118,
    available: true,
    shift: "24 Hour",
    languages: ["English", "Hindi"],
    description: "Experienced in caring for bedridden patients including hygiene and pressure sore prevention.",
    services: ["Patient Hygiene", "Bed Mobility", "Medication Monitoring"],
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80"
  },

  {
    id: 14,
    name: "Palliative Care Nurse",
    speciality: "End of Life Care",
    experience: "11 Years",
    qualification: "BSc Nursing",
    hospital: "AIIMS Delhi",
    price: 1990.99,
    rating: 4.9,
    totalReviews: 176,
    available: true,
    shift: "24 Hour",
    languages: ["English", "Hindi"],
    description: "Highly trained palliative care nurse providing compassionate end-of-life care.",
    services: ["Pain Management", "Patient Comfort Care", "Family Support"],
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80"
  }
];

export const AMBULANCE_DATA = [
  {
    id: 1,
    name: "Cardiac Care ALS",
    type: "ALS",
    vendor: "LifeLine Services",
    price: 1500,
    distance: 2.5,
    rating: 5,
    image: "https://images.unsplash.com/photo-1587748801476-6218d60ad48c?auto=format&fit=crop&w=400&q=80",
    description: "Advanced cardiac life support ambulance equipped with ventilator and cardiac monitoring.",
    driver: "Rajesh Kumar",
    experience: "8 Years",
    contact: "+91 9876543210",
    equipment: ["Ventilator", "Defibrillator", "ECG Monitor", "Oxygen Support"],
    available24x7: true,
    capacity: "1 Patient + 2 Attendants"
  },

  {
    id: 2,
    name: "Emergency Trauma ALS",
    type: "ALS",
    vendor: "RapidCare Ambulance",
    price: 1700,
    distance: 3.1,
    rating: 4,
    image: "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&w=400&q=80",
    description: "Specialized ambulance for trauma emergencies with advanced life-saving equipment.",
    driver: "Amit Singh",
    experience: "10 Years",
    contact: "+91 9812345678",
    equipment: ["Ventilator", "Spine Board", "Defibrillator", "Trauma Kit"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 3,
    name: "Basic Life Support Van",
    type: "BLS",
    vendor: "CityMed Ambulance",
    price: 900,
    distance: 4.2,
    rating: 4,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
    description: "Basic ambulance for stable patients requiring transport to hospital.",
    driver: "Sunil Verma",
    experience: "6 Years",
    contact: "+91 9123456780",
    equipment: ["Oxygen Cylinder", "Stretcher", "First Aid Kit"],
    available24x7: true,
    capacity: "1 Patient + 2 Attendants"
  },

  {
    id: 4,
    name: "Neonatal ICU Ambulance",
    type: "NICU",
    vendor: "MotherCare Emergency",
    price: 2200,
    distance: 6.5,
    rating: 5,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
    description: "Special ambulance designed for newborn babies with incubator and neonatal support.",
    driver: "Manoj Sharma",
    experience: "7 Years",
    contact: "+91 9345678912",
    equipment: ["Infant Incubator", "Oxygen Support", "Neonatal Ventilator"],
    available24x7: true,
    capacity: "1 Infant + 2 Medical Staff"
  },

  {
    id: 5,
    name: "Patient Transfer Ambulance",
    type: "BLS",
    vendor: "MediShift Transport",
    price: 800,
    distance: 5.8,
    rating: 3,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
    description: "Affordable ambulance service for non-emergency patient transfers.",
    driver: "Rohit Gupta",
    experience: "5 Years",
    contact: "+91 9654321876",
    equipment: ["Stretcher", "Wheelchair", "Basic First Aid"],
    available24x7: true,
    capacity: "1 Patient + 2 Attendants"
  },

  {
    id: 6,
    name: "ICU Plus Ambulance",
    type: "ICU",
    vendor: "CriticalCare Mobility",
    price: 2500,
    distance: 3.7,
    rating: 5,
    image: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=400&q=80",
    description: "Fully equipped ICU ambulance with ventilator and trained paramedics.",
    driver: "Deepak Yadav",
    experience: "9 Years",
    contact: "+91 9988776655",
    equipment: ["Ventilator", "Defibrillator", "Infusion Pump", "Cardiac Monitor"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 7,
    name: "Highway Emergency Ambulance",
    type: "ALS",
    vendor: "Highway Rescue",
    price: 1600,
    distance: 9.2,
    rating: 4,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
    description: "Fast-response ambulance designed for highway emergencies and accident cases.",
    driver: "Anil Chauhan",
    experience: "11 Years",
    contact: "+91 9012345678",
    equipment: ["Trauma Kit", "Ventilator", "Oxygen", "Spine Board"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 8,
    name: "Event Medical Ambulance",
    type: "BLS",
    vendor: "SafeEvent Medical",
    price: 1000,
    distance: 7.1,
    rating: 4,
    image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
    description: "Ambulance service for sports events, concerts, and public gatherings.",
    driver: "Karan Malhotra",
    experience: "6 Years",
    contact: "+91 9321456789",
    equipment: ["First Aid Kit", "Oxygen Cylinder", "Basic Monitoring"],
    available24x7: false,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 9,
    name: "Air Ambulance Coordination",
    type: "Air",
    vendor: "SkyMed Emergency",
    price: 12000,
    distance: 15,
    rating: 5,
    image: "https://images.unsplash.com/photo-1581093458791-9d09b0b2e7a4?auto=format&fit=crop&w=400&q=80",
    description: "Air ambulance service for long-distance critical patient transfer.",
    driver: "Pilot Team",
    experience: "15 Years",
    contact: "+91 8899001122",
    equipment: ["Ventilator", "ICU Bed", "Cardiac Monitor"],
    available24x7: true,
    capacity: "1 Patient + 3 Medical Staff"
  },

  {
    id: 10,
    name: "Dialysis Transport Ambulance",
    type: "BLS",
    vendor: "CareMove Services",
    price: 950,
    distance: 4.4,
    rating: 4,
    image: "https://images.unsplash.com/photo-1581595219319-5f7d6b6a2b4a?auto=format&fit=crop&w=400&q=80",
    description: "Safe transport ambulance for dialysis patients.",
    driver: "Suresh Patel",
    experience: "7 Years",
    contact: "+91 9234567810",
    equipment: ["Wheelchair", "Stretcher", "Oxygen"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 11,
    name: "Senior Citizen Ambulance",
    type: "BLS",
    vendor: "GoldenCare Mobility",
    price: 850,
    distance: 2.9,
    rating: 4,
    image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",
    description: "Comfortable ambulance service designed for elderly patients.",
    driver: "Mahesh Kumar",
    experience: "8 Years",
    contact: "+91 9871203456",
    equipment: ["Wheelchair", "Oxygen", "First Aid"],
    available24x7: true,
    capacity: "1 Patient + 2 Attendants"
  },

  {
    id: 12,
    name: "Accident Rescue Ambulance",
    type: "ALS",
    vendor: "RescueLine Emergency",
    price: 1800,
    distance: 6.8,
    rating: 5,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    description: "Specialized accident rescue ambulance with trauma support equipment.",
    driver: "Vikas Thakur",
    experience: "12 Years",
    contact: "+91 9765432109",
    equipment: ["Trauma Kit", "Ventilator", "Defibrillator"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 13,
    name: "Rural Medical Ambulance",
    type: "BLS",
    vendor: "VillageCare Services",
    price: 700,
    distance: 12.3,
    rating: 3,
    image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
    description: "Ambulance service covering rural areas and villages.",
    driver: "Hari Singh",
    experience: "9 Years",
    contact: "+91 9345012789",
    equipment: ["First Aid Kit", "Oxygen Cylinder"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  },

  {
    id: 14,
    name: "Hospital Transfer ICU Ambulance",
    type: "ICU",
    vendor: "MediBridge Transfer",
    price: 2100,
    distance: 3.4,
    rating: 5,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
    description: "ICU ambulance for transferring critical patients between hospitals.",
    driver: "Naveen Joshi",
    experience: "10 Years",
    contact: "+91 9098765432",
    equipment: ["Ventilator", "Infusion Pump", "Defibrillator", "Cardiac Monitor"],
    available24x7: true,
    capacity: "1 Patient + 1 Attendant"
  }
];

export const HOSPITAL_DATA = [
  {
    id: 1,
    name: "Yash Hospital",
    address: "TDI City, Sector 118",
    distance: 8737,
    rating: 4,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Orthopedics", "Neurology"],
    doctors: 35,
    beds: 120,
    emergency: true,
    phone: "+91 9876543210",
    website: "www.yashhospital.com",
    timing: "24 Hours",
    about: "Yash Hospital provides advanced healthcare with modern infrastructure and experienced doctors.",
    services: ["ICU", "Emergency Care", "Diagnostics", "Pharmacy"]
  },

  {
    id: 2,
    name: "City Care Hospital",
    address: "Sector 70, Mohali",
    distance: 6520,
    rating: 5,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "General Surgery"],
    doctors: 28,
    beds: 95,
    emergency: true,
    phone: "+91 9812345678",
    website: "www.citycarehospital.com",
    timing: "24 Hours",
    about: "City Care Hospital is known for emergency care and specialized cardiac treatments.",
    services: ["ICU", "Trauma Care", "Radiology", "Pharmacy"]
  },

  {
    id: 3,
    name: "Apollo Health Center",
    address: "Sector 21, Chandigarh",
    distance: 5200,
    rating: 5,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Neurology", "Oncology"],
    doctors: 60,
    beds: 200,
    emergency: true,
    phone: "+91 9871204567",
    website: "www.apollohealth.com",
    timing: "24 Hours",
    about: "Apollo Health Center provides advanced multi-specialty healthcare services.",
    services: ["ICU", "Cancer Care", "Diagnostics", "Pharmacy"]
  },

  {
    id: 4,
    name: "Fortis Hospital",
    address: "Sector 62, Mohali",
    distance: 7300,
    rating: 5,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Orthopedics", "Gastroenterology"],
    doctors: 80,
    beds: 300,
    emergency: true,
    phone: "+91 9988776655",
    website: "www.fortishospital.com",
    timing: "24 Hours",
    about: "Fortis Hospital is one of the leading healthcare providers with world-class facilities.",
    services: ["ICU", "Emergency Care", "Diagnostics", "Pharmacy", "Ambulance"]
  },

  {
    id: 5,
    name: "Prime Medical Hospital",
    address: "Sector 45, Chandigarh",
    distance: 4800,
    rating: 4,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    specialties: ["Dermatology", "ENT"],
    doctors: 18,
    beds: 70,
    emergency: false,
    phone: "+91 9345678123",
    website: "www.primemedical.com",
    timing: "9 AM - 10 PM",
    about: "Prime Medical Hospital focuses on outpatient and specialty treatments.",
    services: ["Diagnostics", "Pharmacy"]
  },

  {
    id: 6,
    name: "LifeLine MultiSpecialty",
    address: "Phase 7, Mohali",
    distance: 6100,
    rating: 4,
    image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Pediatrics"],
    doctors: 32,
    beds: 110,
    emergency: true,
    phone: "+91 9123456789",
    website: "www.lifelinehospital.com",
    timing: "24 Hours",
    about: "LifeLine Hospital offers comprehensive healthcare with modern technology.",
    services: ["ICU", "Emergency", "Pharmacy"]
  },

  {
    id: 7,
    name: "Healing Touch Hospital",
    address: "Sector 22, Chandigarh",
    distance: 5400,
    rating: 4,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
    specialties: ["Orthopedics", "Physiotherapy"],
    doctors: 20,
    beds: 80,
    emergency: true,
    phone: "+91 9234567890",
    website: "www.healingtouch.com",
    timing: "24 Hours",
    about: "Healing Touch Hospital is known for orthopedic treatments and rehabilitation.",
    services: ["ICU", "Physiotherapy", "Diagnostics"]
  },

  {
    id: 8,
    name: "Green Valley Hospital",
    address: "Sector 50, Chandigarh",
    distance: 4600,
    rating: 3,
    image: "https://images.unsplash.com/photo-1581595219319-5f7d6b6a2b4a?auto=format&fit=crop&w=400&q=80",
    specialties: ["General Medicine"],
    doctors: 15,
    beds: 50,
    emergency: false,
    phone: "+91 9988123456",
    website: "www.greenvalleyhospital.com",
    timing: "9 AM - 9 PM",
    about: "Affordable healthcare facility providing general medical services.",
    services: ["Diagnostics", "Pharmacy"]
  },

  {
    id: 9,
    name: "Sunrise Medical Center",
    address: "Sector 34, Chandigarh",
    distance: 4900,
    rating: 4,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80",
    specialties: ["Gynecology", "Pediatrics"],
    doctors: 25,
    beds: 90,
    emergency: true,
    phone: "+91 9012345678",
    website: "www.sunrisemedical.com",
    timing: "24 Hours",
    about: "Sunrise Medical Center provides specialized women and child healthcare.",
    services: ["ICU", "Maternity", "Diagnostics"]
  },

  {
    id: 10,
    name: "MetroCare Hospital",
    address: "Sector 71, Mohali",
    distance: 7000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1581093458791-9d09b0b2e7a4?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Neurology"],
    doctors: 45,
    beds: 150,
    emergency: true,
    phone: "+91 8899776655",
    website: "www.metrocarehospital.com",
    timing: "24 Hours",
    about: "MetroCare Hospital specializes in advanced cardiac and neurological treatments.",
    services: ["ICU", "Emergency", "Diagnostics", "Ambulance"]
  },

  {
    id: 11,
    name: "CareWell Hospital",
    address: "Sector 12, Panchkula",
    distance: 8200,
    rating: 4,
    image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
    specialties: ["General Medicine", "Orthopedics"],
    doctors: 22,
    beds: 75,
    emergency: true,
    phone: "+91 9765432109",
    website: "www.carewellhospital.com",
    timing: "24 Hours",
    about: "CareWell Hospital focuses on quality treatment and patient care.",
    services: ["Emergency", "Diagnostics"]
  },

  {
    id: 12,
    name: "Royal Healthcare Hospital",
    address: "Sector 19, Chandigarh",
    distance: 5700,
    rating: 5,
    image: "https://images.unsplash.com/photo-1581594549595-35f6edc8e2e7?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Oncology"],
    doctors: 55,
    beds: 210,
    emergency: true,
    phone: "+91 9345012789",
    website: "www.royalhealthcare.com",
    timing: "24 Hours",
    about: "Royal Healthcare Hospital provides world-class multi-specialty treatments.",
    services: ["ICU", "Cancer Care", "Diagnostics"]
  },

  {
    id: 13,
    name: "Hope Medical Institute",
    address: "Sector 14, Panchkula",
    distance: 6800,
    rating: 4,
    image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",
    specialties: ["Dermatology", "ENT"],
    doctors: 19,
    beds: 60,
    emergency: false,
    phone: "+91 9871209876",
    website: "www.hopemedical.com",
    timing: "9 AM - 8 PM",
    about: "Hope Medical Institute specializes in dermatology and ENT treatments.",
    services: ["Diagnostics"]
  },

  {
    id: 14,
    name: "MedLife SuperSpecialty",
    address: "Sector 44, Chandigarh",
    distance: 5200,
    rating: 5,
    image: "https://images.unsplash.com/photo-1576765607924-3f0c2d6b7c10?auto=format&fit=crop&w=400&q=80",
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    doctors: 70,
    beds: 250,
    emergency: true,
    phone: "+91 9098765432",
    website: "www.medlifehospital.com",
    timing: "24 Hours",
    about: "MedLife SuperSpecialty Hospital offers advanced medical care with modern technology.",
    services: ["ICU", "Emergency", "Diagnostics", "Pharmacy", "Ambulance"]
  }
];

export const INITIAL_PACKAGES = [
  {
    id: 4,
    name: "Heart Health Package",
    vendor: "City Care Diagnostics",
    price: "₹4,500",
    discountPrice: "₹2,799",
    priceValue: 2799,
    image: "https://images.unsplash.com/photo-1580281657521-6b6b2c8b8f6c?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 2.1,
    tests: "Includes 25 Parameters",
    detailedTests: [
      "ECG",
      "2D Echo",
      "Lipid Profile",
      "High Sensitivity CRP",
      "Homocysteine",
      "Troponin I",
      "CK-MB"
    ]
  },
  {
    id: 5,
    name: "Thyroid Profile Advanced",
    vendor: "Metro Lab Services",
    price: "₹1,800",
    discountPrice: "₹899",
    priceValue: 899,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    distance: 4.8,
    tests: "Includes 10 Parameters",
    detailedTests: [
      "TSH",
      "T3 Total",
      "T4 Total",
      "Free T3",
      "Free T4",
      "Anti-TPO Antibodies"
    ]
  },
  {
    id: 6,
    name: "Kidney Function Test",
    vendor: "Prime Diagnostics",
    price: "₹2,200",
    discountPrice: "₹1,299",
    priceValue: 1299,
    image: "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 6.3,
    tests: "Includes 15 Parameters",
    detailedTests: [
      "Creatinine",
      "Blood Urea",
      "Uric Acid",
      "Sodium",
      "Potassium",
      "Chloride",
      "Glomerular Filtration Rate"
    ]
  },
  {
    id: 7,
    name: "Liver Function Test",
    vendor: "Apollo Diagnostic Hub",
    price: "₹1,500",
    discountPrice: "₹799",
    priceValue: 799,
    image: "https://images.unsplash.com/photo-1576765607924-3f0c2d6b7c10?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 1.9,
    tests: "Includes 12 Parameters",
    detailedTests: [
      "SGPT (ALT)",
      "SGOT (AST)",
      "Alkaline Phosphatase",
      "Bilirubin Total",
      "Bilirubin Direct",
      "Total Protein",
      "Albumin"
    ]
  },
  {
    id: 8,
    name: "Vitamin Deficiency Panel",
    vendor: "Wellness Path Labs",
    price: "₹3,000",
    discountPrice: "₹1,999",
    priceValue: 1999,
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    distance: 3.5,
    tests: "Includes 8 Parameters",
    detailedTests: [
      "Vitamin D",
      "Vitamin B12",
      "Calcium",
      "Iron",
      "Ferritin",
      "Magnesium"
    ]
  },
  {
    id: 9,
    name: "Women's Health Package",
    vendor: "CareFirst Diagnostics",
    price: "₹6,500",
    discountPrice: "₹3,999",
    priceValue: 3999,
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 2.7,
    tests: "Includes 55 Parameters",
    detailedTests: [
      "CBC",
      "Thyroid Profile",
      "Pap Smear",
      "Hormone Panel",
      "Lipid Profile",
      "Blood Sugar Fasting",
      "Vitamin D"
    ]
  },
  {
    id: 10,
    name: "Men's Health Package",
    vendor: "HealthSecure Labs",
    price: "₹6,000",
    discountPrice: "₹3,499",
    priceValue: 3499,
    image: "https://images.unsplash.com/photo-1588776814546-ec7e2b57c2d6?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 4.1,
    tests: "Includes 50 Parameters",
    detailedTests: [
      "CBC",
      "PSA",
      "Testosterone",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "Blood Sugar"
    ]
  },
  {
    id: 11,
    name: "Senior Citizen Health Package",
    vendor: "GoldenCare Diagnostics",
    price: "₹7,500",
    discountPrice: "₹4,999",
    priceValue: 4999,
    image: "https://images.unsplash.com/photo-1580281658629-58c4e4dba9c9?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    distance: 2.4,
    tests: "Includes 70 Parameters",
    detailedTests: [
      "Complete Hemogram",
      "Lipid Profile",
      "Kidney Function Test",
      "Liver Function Test",
      "Thyroid Profile",
      "Vitamin B12",
      "Blood Sugar Fasting"
    ]
  },
  {
    id: 12,
    name: "Fever Screening Panel",
    vendor: "RapidCare Labs",
    price: "₹1,200",
    discountPrice: "₹699",
    priceValue: 699,
    image: "https://images.unsplash.com/photo-1581594549595-35f6edc8e2e7?auto=format&fit=crop&w=400&q=80",
    rating: 3,
    distance: 5.9,
    tests: "Includes 18 Parameters",
    detailedTests: [
      "CBC",
      "Malaria Antigen",
      "Dengue NS1",
      "Typhoid Test",
      "ESR",
      "CRP"
    ]
  },
  {
    id: 13,
    name: "Pre-Employment Health Checkup",
    vendor: "WorkFit Diagnostics",
    price: "₹3,500",
    discountPrice: "₹2,199",
    priceValue: 2199,
    image: "https://images.unsplash.com/photo-1581595219341-7a5d2e0b8c9e?auto=format&fit=crop&w=400&q=80",
    rating: 4,
    distance: 3.8,
    tests: "Includes 40 Parameters",
    detailedTests: [
      "CBC",
      "Blood Sugar",
      "Urine Routine",
      "Liver Function Test",
      "Kidney Function Test",
      "Chest X-Ray",
      "HIV Screening"
    ]
  }
];