import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "bn" | "en" | "ctg" | "noakhali";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Common
    home: "হোম",
    settings: "সেটিংস",
    back: "ফিরে যান",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    loading: "লোড হচ্ছে...",
    error: "ত্রুটি হয়েছে",
    success: "সফল হয়েছে",
    
    // App
    appName: "agriশক্তি",
    tagline: "মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি",
    beta: "বেটা",
    
    // Services
    diseaseDetection: "রোগ শনাক্তকরণ",
    diseaseDesc: "ফসলের রোগ চিনুন",
    fertilizerScan: "সার স্ক্যান",
    fertilizerDesc: "সার যাচাই করুন",
    pestMap: "পোকার ম্যাপ",
    pestDesc: "এলাকার পোকা দেখুন",
    aiAssistant: "AI সহায়ক",
    aiDesc: "কৃষি পরামর্শ নিন",
    marketPrice: "বাজার দর",
    marketDesc: "বাজার মূল্য দেখুন",
    weather: "আবহাওয়া",
    weatherDesc: "আবহাওয়া পূর্বাভাস",
    satellite: "স্যাটেলাইট ভিশন",
    satelliteDesc: "NDVI ম্যাপ দেখুন",
    calendar: "ফার্মিং ক্যালেন্ডার",
    calendarDesc: "কাজের সময়সূচী",
    machine: "যন্ত্র অপ্টিমাইজার",
    machineDesc: "ট্রাক্টর/টিলার গাইড",
    npkCalculator: "সার ক্যালকুলেটর",
    npkDesc: "NPK ডোজ হিসাব",
    climateAlert: "জলবায়ু সতর্কতা",
    climateDesc: "দুর্যোগ সতর্কতা",
    govServices: "সরকারি সেবা",
    govDesc: "ভর্তুকি ও ঋণ",
    storage: "গুদাম ব্যবস্থাপনা",
    storageDesc: "ফসল সংরক্ষণ",
    history: "ফসল ইতিহাস",
    historyDesc: "আগের স্ক্যান দেখুন",
    rewards: "পুরস্কার",
    rewardsDesc: "ব্যাজ ও পয়েন্ট",
    fertilizerAdvice: "সার পরামর্শ",
    fertAdviceDesc: "সার সুপারিশ",
    knowledge: "কৃষি জ্ঞান",
    knowledgeDesc: "শিখুন ও জানুন",
    community: "কমিউনিটি",
    communityDesc: "কৃষক সংঘ",
    appGuide: "অ্যাপ গাইড",
    guideDesc: "টিউটোরিয়াল দেখুন",
    landCalculator: "জমি হিসাব",
    landDesc: "জমির মাপ ও দাম",
    
    // Header
    loggedIn: "লগইন করা আছে",
    welcome: "স্বাগতম!",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    profile: "প্রোফাইল",
    logout: "লগআউট",
    login: "লগইন / রেজিস্টার",
    findingLocation: "লোকেশন খুঁজছি...",
    
    // Stats
    scans: "স্ক্যান",
    level: "লেভেল",
    rank: "র‍্যাংক",
    
    // Tips
    todayTip: "আজকের টিপস",
    
    // Market
    rice: "ধান",
    potato: "আলু",
    onion: "পেঁয়াজ",
    weeklyAvg: "সাপ্তাহিক গড়",
    
    // Settings
    customizeApp: "অ্যাপ কাস্টমাইজ করুন",
    language: "ভাষা",
    bangla: "বাংলা",
    english: "English",
    chittagongian: "চট্টগ্রামী",
    noakhalian: "নোয়াখালী",
    notifications: "নোটিফিকেশন",
    pushNotifications: "পুশ নোটিফিকেশন",
    weatherMarketUpdate: "আবহাওয়া ও বাজার আপডেট",
    smsNotifications: "SMS নোটিফিকেশন",
    importantAlerts: "গুরুত্বপূর্ণ সতর্কতা",
    account: "অ্যাকাউন্ট",
    namePhone: "নাম ও ফোন নম্বর",
    privacy: "গোপনীয়তা",
    dataProtection: "ডাটা সুরক্ষা সেটিংস",
    help: "সাহায্য",
    faq: "প্রশ্ন ও উত্তর",
    aboutApp: "অ্যাপ সম্পর্কে",
    version: "সংস্করণ ১.০.০",
    aiAssistantFull: "বাংলার কৃষকের AI সহকারী",
    createdBy: "Created by TEAM_NEWBIES",
    selectLanguage: "ভাষা নির্বাচন করুন",
    chooseLanguage: "আপনার পছন্দের ভাষা বেছে নিন",
    enterPhone: "ফোন নম্বর দিন",
    phoneNumber: "ফোন নম্বর",
    smsSaved: "SMS নোটিফিকেশন সক্রিয় হয়েছে",
    smsDisabled: "SMS নোটিফিকেশন বন্ধ হয়েছে",
    languageChanged: "ভাষা পরিবর্তন হয়েছে",
    validPhone: "সঠিক ফোন নম্বর দিন",
    smsDescription: "SMS নোটিফিকেশন পেতে আপনার মোবাইল নম্বর দিন",
    
    // Land Calculator
    landCalculatorTitle: "জমি হিসাব ক্যালকুলেটর",
    landCalculatorDesc: "জমির মাপ ও মূল্য হিসাব করুন",
    enterLandSize: "জমির পরিমাণ দিন",
    selectUnit: "একক নির্বাচন করুন",
    bigha: "বিঘা",
    katha: "কাঠা",
    decimal: "শতক",
    acre: "একর",
    sqFeet: "বর্গফুট",
    sqMeter: "বর্গমিটার",
    calculate: "হিসাব করুন",
    result: "ফলাফল",
    pricePerUnit: "প্রতি একক মূল্য (টাকা)",
    totalPrice: "মোট মূল্য",
    conversion: "রূপান্তর",
    reset: "রিসেট",
    
    // Offline
    offlineMode: "অফলাইন মোড",
    offlineMessage: "ইন্টারনেট নেই। সীমিত সুবিধা পাবেন।",
    
    // Chat
    askQuestion: "প্রশ্ন করুন...",
    voiceInput: "ভয়েস ইনপুট",
    send: "পাঠান",
    
    // Auth
    loginTitle: "লগইন করুন",
    registerTitle: "রেজিস্টার করুন",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    fullName: "পুরো নাম",
    loginSuccess: "সফলভাবে লগইন হয়েছে",
    logoutSuccess: "সফলভাবে লগআউট হয়েছে",
    logoutError: "লগআউট করতে সমস্যা হয়েছে",
  },
  en: {
    // Common
    home: "Home",
    settings: "Settings",
    back: "Go Back",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success",
    
    // App
    appName: "agriShokti",
    tagline: "Soil, People, Technology – New Power of Agriculture",
    beta: "Beta",
    
    // Services
    diseaseDetection: "Disease Detection",
    diseaseDesc: "Identify crop diseases",
    fertilizerScan: "Fertilizer Scan",
    fertilizerDesc: "Verify fertilizers",
    pestMap: "Pest Map",
    pestDesc: "View area pests",
    aiAssistant: "AI Assistant",
    aiDesc: "Get farming advice",
    marketPrice: "Market Price",
    marketDesc: "View market prices",
    weather: "Weather",
    weatherDesc: "Weather forecast",
    satellite: "Satellite Vision",
    satelliteDesc: "View NDVI maps",
    calendar: "Farming Calendar",
    calendarDesc: "Work schedule",
    machine: "Machine Optimizer",
    machineDesc: "Tractor/Tiller guide",
    npkCalculator: "Fertilizer Calculator",
    npkDesc: "NPK dose calculation",
    climateAlert: "Climate Alert",
    climateDesc: "Disaster warnings",
    govServices: "Gov Services",
    govDesc: "Subsidies & loans",
    storage: "Storage Management",
    storageDesc: "Crop storage",
    history: "Crop History",
    historyDesc: "View past scans",
    rewards: "Rewards",
    rewardsDesc: "Badges & points",
    fertilizerAdvice: "Fertilizer Advice",
    fertAdviceDesc: "Fertilizer recommendations",
    knowledge: "Agricultural Knowledge",
    knowledgeDesc: "Learn & know",
    community: "Community",
    communityDesc: "Farmer community",
    appGuide: "App Guide",
    guideDesc: "View tutorials",
    landCalculator: "Land Calculator",
    landDesc: "Land measurement & price",
    
    // Header
    loggedIn: "Logged in as",
    welcome: "Welcome!",
    createAccount: "Create an account",
    profile: "Profile",
    logout: "Logout",
    login: "Login / Register",
    findingLocation: "Finding location...",
    
    // Stats
    scans: "Scans",
    level: "Level",
    rank: "Rank",
    
    // Tips
    todayTip: "Today's Tips",
    
    // Market
    rice: "Rice",
    potato: "Potato",
    onion: "Onion",
    weeklyAvg: "Weekly Avg",
    
    // Settings
    customizeApp: "Customize your app",
    language: "Language",
    bangla: "বাংলা",
    english: "English",
    chittagongian: "Chittagongian",
    noakhalian: "Noakhalian",
    notifications: "Notifications",
    pushNotifications: "Push Notifications",
    weatherMarketUpdate: "Weather & Market Updates",
    smsNotifications: "SMS Notifications",
    importantAlerts: "Important Alerts",
    account: "Account",
    namePhone: "Name & Phone Number",
    privacy: "Privacy",
    dataProtection: "Data Protection Settings",
    help: "Help",
    faq: "FAQ",
    aboutApp: "About App",
    version: "Version 1.0.0",
    aiAssistantFull: "AI Assistant for Bangladesh Farmers",
    createdBy: "Created by TEAM_NEWBIES",
    selectLanguage: "Select Language",
    chooseLanguage: "Choose your preferred language",
    enterPhone: "Enter Phone Number",
    phoneNumber: "Phone Number",
    smsSaved: "SMS notifications enabled",
    smsDisabled: "SMS notifications disabled",
    languageChanged: "Language changed",
    validPhone: "Enter a valid phone number",
    smsDescription: "Enter your mobile number to receive SMS notifications",
    
    // Land Calculator
    landCalculatorTitle: "Land Calculator",
    landCalculatorDesc: "Calculate land measurement & price",
    enterLandSize: "Enter land size",
    selectUnit: "Select unit",
    bigha: "Bigha",
    katha: "Katha",
    decimal: "Decimal",
    acre: "Acre",
    sqFeet: "Sq Feet",
    sqMeter: "Sq Meter",
    calculate: "Calculate",
    result: "Result",
    pricePerUnit: "Price per unit (Taka)",
    totalPrice: "Total Price",
    conversion: "Conversion",
    reset: "Reset",
    
    // Offline
    offlineMode: "Offline Mode",
    offlineMessage: "No internet. Limited features available.",
    
    // Chat
    askQuestion: "Ask a question...",
    voiceInput: "Voice Input",
    send: "Send",
    
    // Auth
    loginTitle: "Login",
    registerTitle: "Register",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    loginSuccess: "Logged in successfully",
    logoutSuccess: "Logged out successfully",
    logoutError: "Error logging out",
  },
  ctg: {
    // Chittagongian dialect
    // Common
    home: "ঘর",
    settings: "সেটিংস",
    back: "ফিরা যাও",
    save: "রাখো",
    cancel: "বাদ দে",
    loading: "লোড অইতাছে...",
    error: "সমস্যা অইছে",
    success: "অইয়া গেছে",
    
    // App
    appName: "agriশক্তি",
    tagline: "মাডি, মানুষ, প্রযুক্তি – খেতির নুয়া শক্তি",
    beta: "বেটা",
    
    // Services
    diseaseDetection: "রোগ চিনা",
    diseaseDesc: "ফসলর রোগ চিন",
    fertilizerScan: "সার স্ক্যান",
    fertilizerDesc: "সার যাচাই গর",
    pestMap: "পোকার ম্যাপ",
    pestDesc: "এলাকার পোকা দেখ",
    aiAssistant: "AI সাহায্যকারী",
    aiDesc: "খেতির পরামর্শ নে",
    marketPrice: "বাজার দাম",
    marketDesc: "বাজার দাম দেখ",
    weather: "আবহাওয়া",
    weatherDesc: "আবহাওয়া খবর",
    satellite: "স্যাটেলাইট ভিশন",
    satelliteDesc: "NDVI ম্যাপ দেখ",
    calendar: "খেতির ক্যালেন্ডার",
    calendarDesc: "কাজর সময়",
    machine: "যন্ত্র অপ্টিমাইজার",
    machineDesc: "ট্রাক্টর গাইড",
    npkCalculator: "সার ক্যালকুলেটর",
    npkDesc: "NPK ডোজ হিসাব",
    climateAlert: "জলবায়ু সতর্কতা",
    climateDesc: "দুর্যোগ সতর্কতা",
    govServices: "সরকারি সেবা",
    govDesc: "ভর্তুকি ও ঋণ",
    storage: "গুদাম ব্যবস্থাপনা",
    storageDesc: "ফসল রাখা",
    history: "ফসল ইতিহাস",
    historyDesc: "আগের স্ক্যান দেখ",
    rewards: "পুরস্কার",
    rewardsDesc: "ব্যাজ ও পয়েন্ট",
    fertilizerAdvice: "সার পরামর্শ",
    fertAdviceDesc: "সার সুপারিশ",
    knowledge: "খেতির জ্ঞান",
    knowledgeDesc: "শিখ ও জান",
    community: "কমিউনিটি",
    communityDesc: "কৃষক সংঘ",
    appGuide: "অ্যাপ গাইড",
    guideDesc: "টিউটোরিয়াল দেখ",
    landCalculator: "জমি হিসাব",
    landDesc: "জমির মাপ ও দাম",
    
    // Header
    loggedIn: "লগইন অইছো",
    welcome: "স্বাগতম!",
    createAccount: "একাউন্ট খোল",
    profile: "প্রোফাইল",
    logout: "লগআউট",
    login: "লগইন / রেজিস্টার",
    findingLocation: "লোকেশন খুঁজতাছি...",
    
    // Stats
    scans: "স্ক্যান",
    level: "লেভেল",
    rank: "র‍্যাংক",
    
    // Tips
    todayTip: "আইজকার টিপস",
    
    // Market
    rice: "ধান",
    potato: "আলু",
    onion: "পিঁয়াজ",
    weeklyAvg: "সাপ্তাহিক গড়",
    
    // Settings
    customizeApp: "অ্যাপ কাস্টমাইজ গর",
    language: "ভাষা",
    bangla: "বাংলা",
    english: "English",
    chittagongian: "চাঁটগাঁইয়া",
    noakhalian: "নোয়াখাইল্যা",
    notifications: "নোটিফিকেশন",
    pushNotifications: "পুশ নোটিফিকেশন",
    weatherMarketUpdate: "আবহাওয়া ও বাজার আপডেট",
    smsNotifications: "SMS নোটিফিকেশন",
    importantAlerts: "গুরুত্বপূর্ণ সতর্কতা",
    account: "একাউন্ট",
    namePhone: "নাম ও ফোন নম্বর",
    privacy: "গোপনীয়তা",
    dataProtection: "ডাটা সুরক্ষা সেটিংস",
    help: "সাহায্য",
    faq: "প্রশ্ন ও উত্তর",
    aboutApp: "অ্যাপ সম্পর্কে",
    version: "সংস্করণ ১.০.০",
    aiAssistantFull: "বাংলার কৃষকর AI সহকারী",
    createdBy: "Created by TEAM_NEWBIES",
    selectLanguage: "ভাষা বাছাই গর",
    chooseLanguage: "তোর পছন্দর ভাষা বাছাই গর",
    enterPhone: "ফোন নম্বর দে",
    phoneNumber: "ফোন নম্বর",
    smsSaved: "SMS নোটিফিকেশন চালু অইছে",
    smsDisabled: "SMS নোটিফিকেশন বন্ধ অইছে",
    languageChanged: "ভাষা বদলাইছে",
    validPhone: "ঠিক ফোন নম্বর দে",
    smsDescription: "SMS পাইতে মোবাইল নম্বর দে",
    
    // Land Calculator
    landCalculatorTitle: "জমি হিসাব ক্যালকুলেটর",
    landCalculatorDesc: "জমির মাপ ও দাম হিসাব গর",
    enterLandSize: "জমির পরিমাণ দে",
    selectUnit: "একক বাছাই গর",
    bigha: "বিঘা",
    katha: "কাঠা",
    decimal: "শতক",
    acre: "একর",
    sqFeet: "বর্গফুট",
    sqMeter: "বর্গমিটার",
    calculate: "হিসাব গর",
    result: "ফলাফল",
    pricePerUnit: "প্রতি একক দাম (টেহা)",
    totalPrice: "মোট দাম",
    conversion: "রূপান্তর",
    reset: "রিসেট",
    
    // Offline
    offlineMode: "অফলাইন মোড",
    offlineMessage: "নেট নাই। সীমিত সুবিধা পাইবা।",
    
    // Chat
    askQuestion: "জিগাও...",
    voiceInput: "ভয়েস ইনপুট",
    send: "পাঠাও",
    
    // Auth
    loginTitle: "লগইন গর",
    registerTitle: "রেজিস্টার গর",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    fullName: "পুরা নাম",
    loginSuccess: "লগইন অইছে",
    logoutSuccess: "লগআউট অইছে",
    logoutError: "লগআউট করতে সমস্যা অইছে",
  },
  noakhali: {
    // Noakhali dialect
    // Common
    home: "বাড়ি",
    settings: "সেটিংস",
    back: "ফিরাইয়া যাও",
    save: "রাখ",
    cancel: "বাদ দে",
    loading: "লোড হইতাসে...",
    error: "সমস্যা হইসে",
    success: "হইয়া গেসে",
    
    // App
    appName: "agriশক্তি",
    tagline: "মাটি, মানুষ, প্রযুক্তি – কৃষির নয়া শক্তি",
    beta: "বেটা",
    
    // Services
    diseaseDetection: "রোগ শনাক্ত",
    diseaseDesc: "ফসলের রোগ চিন",
    fertilizerScan: "সার স্ক্যান",
    fertilizerDesc: "সার যাসাই কর",
    pestMap: "পোকার ম্যাপ",
    pestDesc: "এলাকার পোকা দেখ",
    aiAssistant: "AI সাহায্য",
    aiDesc: "কৃষি পরামর্শ লও",
    marketPrice: "বাজার দাম",
    marketDesc: "বাজার দাম দেখ",
    weather: "আবহাওয়া",
    weatherDesc: "আবহাওয়া খবর",
    satellite: "স্যাটেলাইট ভিশন",
    satelliteDesc: "NDVI ম্যাপ দেখ",
    calendar: "খেতি ক্যালেন্ডার",
    calendarDesc: "কাজের সময়",
    machine: "যন্ত্র অপ্টিমাইজার",
    machineDesc: "ট্রাক্টর গাইড",
    npkCalculator: "সার ক্যালকুলেটর",
    npkDesc: "NPK ডোজ হিসাব",
    climateAlert: "জলবায়ু সতর্কতা",
    climateDesc: "দুর্যোগ সতর্কতা",
    govServices: "সরকারি সেবা",
    govDesc: "ভর্তুকি ও ঋণ",
    storage: "গুদাম ব্যবস্থাপনা",
    storageDesc: "ফসল রাখা",
    history: "ফসল ইতিহাস",
    historyDesc: "আগের স্ক্যান দেখ",
    rewards: "পুরস্কার",
    rewardsDesc: "ব্যাজ ও পয়েন্ট",
    fertilizerAdvice: "সার পরামর্শ",
    fertAdviceDesc: "সার সুপারিশ",
    knowledge: "খেতি জ্ঞান",
    knowledgeDesc: "শিখ ও জান",
    community: "কমিউনিটি",
    communityDesc: "কৃষক সংঘ",
    appGuide: "অ্যাপ গাইড",
    guideDesc: "টিউটোরিয়াল দেখ",
    landCalculator: "জমি হিসাব",
    landDesc: "জমির মাপ ও দাম",
    
    // Header
    loggedIn: "লগইন আছ",
    welcome: "স্বাগতম!",
    createAccount: "একাউন্ট খোল",
    profile: "প্রোফাইল",
    logout: "লগআউট",
    login: "লগইন / রেজিস্টার",
    findingLocation: "লোকেশন খুঁজতেসি...",
    
    // Stats
    scans: "স্ক্যান",
    level: "লেভেল",
    rank: "র‍্যাংক",
    
    // Tips
    todayTip: "আজকার টিপস",
    
    // Market
    rice: "ধান",
    potato: "আলু",
    onion: "পিয়াজ",
    weeklyAvg: "সাপ্তাহিক গড়",
    
    // Settings
    customizeApp: "অ্যাপ কাস্টমাইজ কর",
    language: "ভাষা",
    bangla: "বাংলা",
    english: "English",
    chittagongian: "চাটগাইয়া",
    noakhalian: "নোয়াখাইল্লা",
    notifications: "নোটিফিকেশন",
    pushNotifications: "পুশ নোটিফিকেশন",
    weatherMarketUpdate: "আবহাওয়া ও বাজার আপডেট",
    smsNotifications: "SMS নোটিফিকেশন",
    importantAlerts: "গুরুত্বপূর্ণ সতর্কতা",
    account: "একাউন্ট",
    namePhone: "নাম ও ফোন নম্বর",
    privacy: "গোপনীয়তা",
    dataProtection: "ডাটা সুরক্ষা সেটিংস",
    help: "সাহায্য",
    faq: "প্রশ্ন ও উত্তর",
    aboutApp: "অ্যাপ সম্পর্কে",
    version: "সংস্করণ ১.০.০",
    aiAssistantFull: "বাংলার কৃষকের AI সহকারী",
    createdBy: "Created by TEAM_NEWBIES",
    selectLanguage: "ভাষা বাছাই কর",
    chooseLanguage: "তোর পছন্দের ভাষা বাছাই কর",
    enterPhone: "ফোন নম্বর দে",
    phoneNumber: "ফোন নম্বর",
    smsSaved: "SMS নোটিফিকেশন চালু হইসে",
    smsDisabled: "SMS নোটিফিকেশন বন্ধ হইসে",
    languageChanged: "ভাষা বদলাইসে",
    validPhone: "ঠিক ফোন নম্বর দে",
    smsDescription: "SMS পাইতে মোবাইল নম্বর দে",
    
    // Land Calculator
    landCalculatorTitle: "জমি হিসাব ক্যালকুলেটর",
    landCalculatorDesc: "জমির মাপ ও দাম হিসাব কর",
    enterLandSize: "জমির পরিমাণ দে",
    selectUnit: "একক বাছাই কর",
    bigha: "বিঘা",
    katha: "কাঠা",
    decimal: "শতক",
    acre: "একর",
    sqFeet: "বর্গফুট",
    sqMeter: "বর্গমিটার",
    calculate: "হিসাব কর",
    result: "ফলাফল",
    pricePerUnit: "প্রতি একক দাম (টাহা)",
    totalPrice: "মোট দাম",
    conversion: "রূপান্তর",
    reset: "রিসেট",
    
    // Offline
    offlineMode: "অফলাইন মোড",
    offlineMessage: "নেট নাই। সীমিত সুবিধা পাইবা।",
    
    // Chat
    askQuestion: "জিগা...",
    voiceInput: "ভয়েস ইনপুট",
    send: "পাঠাও",
    
    // Auth
    loginTitle: "লগইন কর",
    registerTitle: "রেজিস্টার কর",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    fullName: "পুরা নাম",
    loginSuccess: "লগইন হইসে",
    logoutSuccess: "লগআউট হইসে",
    logoutError: "লগআউট করতে সমস্যা হইসে",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "bn";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["bn"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
