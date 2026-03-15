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
    heroTitle: 'Trusted Local Services Across Nepal',
    heroSubtitle: 'Professional services at your doorstep',
    searchPlaceholder: 'What service do you need?',
    bookNow: 'Book Now',
    viewProfile: 'View Profile',
    womenFirst: 'Women First',
    womenFirstDesc: 'Prioritizing female service providers',
    
    // Services
    allServices: 'All Services',
    filters: 'Filters',
    city: 'City',
    allCities: 'All Cities',
    allCategories: 'All Categories',
    resetFilters: 'Reset Filters',
    listView: 'List View',
    mapView: 'Map View',
    filterByCity: 'Filter by City',
    filterByCategory: 'Filter by Category',
    showWomenFirst: 'Show Women Providers First',
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
    registerTitle: 'Join Garuda',
    signingIn: 'Signing in...',
    signingUp: 'Signing up...',
    loginSubtitle: 'Sign in to your account',
    registerSubtitle: 'Create a new account',
    demoAccounts: 'Demo Accounts',
    customer: 'Customer',
    provider: 'Service Provider',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    selectGender: 'Select Gender',
    selectCity: 'Select City',
    selectRole: 'Select Role',
    role: 'Role',
    gender: 'Gender',
    uploadPhoto: 'Upload Photo',
    photoOptional: '📷 Optional - Profile photo',
    photoCanUpdate: '(You can update after creating account)',
    
    // Additional Auth
    alreadyMember: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    failedToLogin: 'Login failed',
    failedToRegister: 'Registration failed',
    
    // Dashboard
    activeBookings: 'Active Bookings',
    pastBookings: 'Past Bookings',
    pendingRequests: 'Pending Requests',
    
    // Trust badges
    new: 'New',
    rising: 'Rising',
    trusted: 'Trusted',
    expert: 'Expert',

    // Additional
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    haveAccount: 'Already have an account?',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    noBookings: 'No bookings yet',
    bookService: 'Book a Service',
    accept: 'Accept',
    decline: 'Decline',
    available: 'Available',
    unavailable: 'Unavailable',
    reviews: 'reviews',
    startingFrom: 'Starting from',
    route: 'Route',
    gettingLocation: 'Getting your location...',
    clickMapToMove: 'Click map to move pin',
    straightLineEstimate: 'Straight-line estimate',
    locationDenied: 'Location denied — showing Kathmandu',
    howItWorks: 'How it Works',
    empoweringWomen: 'Empowering Women in Nepal',
    minRating: 'Min Rating',
    searchProviders: 'Search providers...',
    providersFound: 'providers found',
    within: 'Within',
    with: 'with',
    optional: 'Optional',
    provideService: 'Provide Service',
    
    // FIX 5 - Home page new copy
    heroTitle_new: 'Your Home, Perfectly Served',
    heroSubtitle_new: 'From leaky pipes to glowing skin — trusted professionals at your doorstep, every single time.',
    searchPlaceholder_new: 'What can we fix, clean, or create for you?',
    exploreServices: 'Explore Services →',
    whyChooseUs: 'Why Thousands Trust Garuda',
    howItWorksTitle: 'Three Steps to a Better Home',
    step1: 'Describe Your Need',
    step1Desc: 'Tell us what you need in plain language or snap a photo.',
    step2: 'Pick Your Pro',
    step2Desc: 'Browse verified providers. Filter by Women First for extra trust.',
    step3: 'Sit Back & Relax',
    step3Desc: 'Your provider arrives on time. Pay after the job is done.',
    womenFirstBanner: 'We Champion Women Professionals',
    womenFirstBannerDesc: 'Over 60% of our providers are women earning independently. When you choose Women First, you empower a family.',
    servicesTitle: 'Everything Your Home Needs',
    featuredProviders: 'Top Rated This Week',
    citiesTitle: 'Serving Across Nepal',
    
    // Dashboard
    customerDashboard: 'Service Purchase Dashboard',
    helloUser: 'Hello',
    bookingNumber: 'Booking No.',
    date: 'Date',
    notSet: 'Not Set',
    location: 'Location',
    price: 'Price',
    status: 'Status',
    viewDetails: 'View Details',
    providerDashboard: 'Service Provider Dashboard',
    completedServices: 'Completed Services',
    totalJobs: 'Total Jobs',
    completedJobs: 'Completed Jobs',
    totalEarnings: 'Total Earnings',
    averageRating: 'Average Rating',
    pendingBookingRequests: 'New Booking Requests',
    providerNotFound: 'Provider not found',
    trustScore: 'Trust Score',
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
    heroTitle: 'नेपालभर भरपर्दो स्थानीय सेवा',
    heroSubtitle: 'तपाईंको ढोकामा व्यावसायिक सेवाहरू',
    searchPlaceholder: 'कुन सेवा चाहिन्छ?',
    bookNow: 'अहिले बुक गर्नुहोस्',
    viewProfile: 'प्रोफाइल हेर्नुहोस्',
    womenFirst: 'महिला प्राथमिकता',
    womenFirstDesc: 'महिला सेवा प्रदायकलाई प्राथमिकता',
    
    // Services
    allServices: 'सबै सेवाहरू',
    filters: 'फिल्टरहरू',
    city: 'शहर',
    allCities: 'सबै शहरहरू',
    allCategories: 'सबै श्रेणीहरू',
    resetFilters: 'फिल्टरहरू रिसेट गर्नुहोस्',
    listView: 'सूची दृश्य',
    mapView: 'नक्सा दृश्य',
    filterByCity: 'शहर अनुसार छान्नुहोस्',
    filterByCategory: 'श्रेणी अनुसार छान्नुहोस्',
    showWomenFirst: 'महिला प्रदायक पहिले देखाउनुहोस्',
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
    registerTitle: 'गरुडा मा सामेल हुनुहोस्',
    signingIn: 'लग इन हो रहेको छ...',
    signingUp: 'साइन अप हो रहेको छ...',
    loginSubtitle: 'खातामा प्रवेश गर्नुहोस्',
    registerSubtitle: 'नयाँ खाता सिर्जना गर्नुहोस्',
    demoAccounts: 'डेमो खाता',
    customer: 'ग्राहक',
    provider: 'सेवा प्रदान गर्नेहरू',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    selectGender: 'लिङ्ग चयन गर्नुहोस्',
    selectCity: 'शहर चयन गर्नुहोस्',
    selectRole: 'भूमिका चयन गर्नुहोस्',
    role: 'भूमिका',
    gender: 'लिङ्ग',
    uploadPhoto: 'फोटो अपलोड गर्नुहोस्',
    photoOptional: '📷 वैकल्पिक - प्रोफाइल फोटो',
    photoCanUpdate: '(खाता सिर्जना पछी अपडेट गर्न सक्नुहुन्छ)',
    
    // Additional Auth
    alreadyMember: 'पहिले नै खाता छ?',
    dontHaveAccount: 'खाता छैन?',
    failedToLogin: 'लग इन असफल',
    failedToRegister: 'दर्ता असफल',
    
    // Dashboard
    activeBookings: 'सक्रिय बुकिङहरू',
    pastBookings: 'पुराना बुकिङहरू',
    pendingRequests: 'पेन्डिङ अनुरोधहरू',
    
    // Trust badges
    new: 'नयाँ',
    rising: 'उदीयमान',
    trusted: 'भरपर्दो',
    expert: 'विशेषज्ञ',

    // Additional
    noAccount: 'खाता छैन?',
    signUp: 'दर्ता गर्नुहोस्',
    haveAccount: 'पहिले नै खाता छ?',
    next: 'अर्को',
    back: 'पछाडि',
    submit: 'पेश गर्नुहोस्',
    noBookings: 'अहिलेसम्म कुनै बुकिङ छैन',
    bookService: 'सेवा बुक गर्नुहोस्',
    accept: 'स्वीकार गर्नुहोस्',
    decline: 'अस्वीकार गर्नुहोस्',
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    reviews: 'समीक्षाहरू',
    startingFrom: 'शुरु मूल्य',
    route: 'मार्ग',
    gettingLocation: 'तपाईंको स्थान पत्ता लगाउँदै...',
    clickMapToMove: 'पिन सार्न नक्सामा क्लिक गर्नुहोस्',
    straightLineEstimate: 'अनुमानित सिधा रेखा दूरी',
    locationDenied: 'स्थान अस्वीकृत — काठमाडौं देखाउँदै',
    howItWorks: 'कसरी काम गर्छ',
    empoweringWomen: 'नेपालमा महिला सशक्तिकरण',
    minRating: 'न्यूनतम रेटिङ',
    searchProviders: 'प्रदायक खोज्नुहोस्...',
    providersFound: 'प्रदायकहरू फेला परे',
    within: 'भित्र',
    with: 'सहित',
    optional: 'वैकल्पिक',
    provideService: 'सेवा प्रदान गर्नुहोस्',
    
    // FIX 5 - Home page new copy
    heroTitle_new: 'तपाईंको घर, सुन्दर सेवाको साथ',
    heroSubtitle_new: 'पाइपको समस्यादेखि सौन्दर्य सेवासम्म — भरपर्दा पेशेवरहरू तपाईंको ढोकामा।',
    searchPlaceholder_new: 'के मर्मत, सफाई वा सेवा चाहिन्छ?',
    exploreServices: 'सेवाहरू हेर्नुहोस् →',
    whyChooseUs: 'किन हजारौं मान्छे गरुडा मा भरोसा गर्छन्',
    howItWorksTitle: 'राम्रो घरका तीन सजिला कदम',
    step1: 'आफ्नो आवश्यकता बताउनुहोस्',
    step1Desc: 'साधारण भाषामा वा फोटो खिचेर बताउनुहोस्।',
    step2: 'आफ्नो प्रो छान्नुहोस्',
    step2Desc: 'प्रमाणित प्रदायकहरू हेर्नुहोस्। महिला पहिले फिल्टर गर्नुहोस्।',
    step3: 'आराम गर्नुहोस्',
    step3Desc: 'तपाईंको प्रदायक समयमा आउनुहुन्छ। काम सकिएपछि भुक्तानी गर्नुहोस्।',
    womenFirstBanner: 'हामी महिला पेशेवरहरूलाई समर्थन गर्छौं',
    womenFirstBannerDesc: 'हाम्रा ६०% भन्दा बढी प्रदायक महिला हुन्। महिला पहिले छान्दा एउटा परिवारलाई सशक्त बनाउनुहुन्छ।',
    servicesTitle: 'तपाईंको घरलाई चाहिने सबै कुरा',
    featuredProviders: 'यस हप्ता शीर्ष रेटेड',
    citiesTitle: 'नेपालभर सेवा',
    
    // Dashboard
    customerDashboard: 'सेवा खरिद डैशबोर्ड',
    helloUser: 'नमस्ते',
    bookingNumber: 'बुकिङ क्र',
    date: 'मिति',
    notSet: 'तोकिएको छैन',
    location: 'स्थान',
    price: 'मूल्य',
    status: 'स्थिति',
    viewDetails: 'विस्तृत विवरण देखुन्नुहोस्',
    providerDashboard: 'सेवा प्रदायक डैशबोर्ड',
    completedServices: 'पूरा भएका सेवाहरू',
    totalJobs: 'कुल कामहरू',
    completedJobs: 'पूरा भएका कामहरू',
    totalEarnings: 'कुल आय',
    averageRating: 'औसत रेटिङ',
    pendingBookingRequests: 'नयाँ बुकिङ अनुरोधहरू',
    providerNotFound: 'सेवा प्रदायक नभेटिएको',
    trustScore: 'विश्वास स्कोर',
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
