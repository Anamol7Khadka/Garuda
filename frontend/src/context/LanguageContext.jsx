import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Navbar
    home: 'Home',
    services: 'Services',
    findNearby: 'Find Nearby',
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Home page
    heroTitle: 'Book Trusted Home Services in Nepal',
    heroSubtitle: 'Professional services at your doorstep',
    searchPlaceholder: 'What service do you need?',
    bookNow: 'Book Now',
    viewProfile: 'View Profile',
    womenFirst: 'Women First',
    womenFirstDesc: 'Prioritizing female service providers',
    
    // Services
    allServices: 'All Services',
    filterByCity: 'Filter by City',
    filterByCategory: 'Filter by Category',
    showWomenFirst: 'Show Women Providers First 💜',
    noProviders: 'No providers found',
    
    // Booking
    describeIssue: 'Describe your issue',
    selectDate: 'Select Date & Time',
    yourAddress: 'Your Address',
    confirmBooking: 'Confirm Booking',
    bookingSuccess: 'Booking Confirmed!',
    
    // Map
    yourLocation: 'Your Location',
    findNearbyTitle: 'Providers Near You',
    clickToRoute: 'Click any provider to see the route',
    showRoute: 'Show Route',
    kmAway: 'km away',
    minDrive: 'min drive',
    minWalk: 'min walk',
    noProvidersNearby: 'No providers found nearby',
    tryIncreasing: 'Try increasing the search radius',
    
    // Auth
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    phone: 'Phone Number',
    loginTitle: 'Welcome Back',
    registerTitle: 'Join SewaSathi',
    
    // Dashboard
    activeBookings: 'Active Bookings',
    pastBookings: 'Past Bookings',
    earnings: 'Earnings',
    pendingRequests: 'Pending Requests',
    
    // Trust badges
    new: 'New',
    rising: 'Rising',
    trusted: 'Trusted',
    expert: 'Expert',
  },
  np: {
    // Navbar
    home: 'गृहपृष्ठ',
    services: 'सेवाहरू',
    findNearby: 'नजिकैमा खोज्नुहोस्',
    dashboard: 'ड्यासबोर्ड',
    login: 'लगइन',
    register: 'दर्ता गर्नुहोस्',
    logout: 'लगआउट',
    
    // Home
    heroTitle: 'नेपालमा विश्वसनीय घरेलु सेवा बुक गर्नुहोस्',
    heroSubtitle: 'तपाईंको ढोकामा व्यावसायिक सेवाहरू',
    searchPlaceholder: 'कुन सेवा चाहिन्छ?',
    bookNow: 'अहिले बुक गर्नुहोस्',
    viewProfile: 'प्रोफाइल हेर्नुहोस्',
    womenFirst: 'महिला प्राथमिकता',
    womenFirstDesc: 'महिला सेवा प्रदायकलाई प्राथमिकता',
    
    // Services
    allServices: 'सबै सेवाहरू',
    filterByCity: 'शहर अनुसार छान्नुहोस्',
    filterByCategory: 'श्रेणी अनुसार छान्नुहोस्',
    showWomenFirst: 'महिला प्रदायक पहिले देखाउनुहोस् 💜',
    noProviders: 'कुनै प्रदायक फेला परेन',
    
    // Booking
    describeIssue: 'समस्या वर्णन गर्नुहोस्',
    selectDate: 'मिति र समय छान्नुहोस्',
    yourAddress: 'तपाईंको ठेगाना',
    confirmBooking: 'बुकिङ पुष्टि गर्नुहोस्',
    bookingSuccess: 'बुकिङ पुष्टि भयो!',
    
    // Map
    yourLocation: 'तपाईंको स्थान',
    findNearbyTitle: 'तपाईंको नजिकका प्रदायकहरू',
    clickToRoute: 'मार्ग हेर्न कुनै प्रदायकमा क्लिक गर्नुहोस्',
    showRoute: 'मार्ग देखाउनुहोस्',
    kmAway: 'किमी टाढा',
    minDrive: 'मिनेट गाडीमा',
    minWalk: 'मिनेट हिँडेर',
    noProvidersNearby: 'नजिकैमा कुनै प्रदायक फेला परेन',
    tryIncreasing: 'खोज दायरा बढाउनुहोस्',
    
    // Auth
    email: 'इमेल',
    password: 'पासवर्ड',
    name: 'पूरा नाम',
    phone: 'फोन नम्बर',
    loginTitle: 'स्वागत छ',
    registerTitle: 'सेवासाथीमा सामेल हुनुहोस्',
    
    // Dashboard
    activeBookings: 'सक्रिय बुकिङहरू',
    pastBookings: 'पुराना बुकिङहरू',
    earnings: 'आम्दानी',
    pendingRequests: 'पेन्डिङ अनुरोधहरू',
    
    // Trust badges
    new: 'नयाँ',
    rising: 'उदीयमान',
    trusted: 'भरपर्दो',
    expert: 'विशेषज्ञ',
  }
}

const LanguageContext = createContext({})

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  )

  const t = (key) => translations[language][key] || translations['en'][key] || key

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
