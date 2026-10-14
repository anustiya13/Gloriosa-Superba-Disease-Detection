// ============================================================
// translations.js — Full Tamil-first translation object
// Default language: Tamil ("ta")
// All user-facing text must come from here — no hardcoded strings.
// ============================================================

const translations = {
  // ══════════════════════════════════════════════════════════
  // TAMIL (Default)
  // ══════════════════════════════════════════════════════════
  ta: {
    // App
    appName: "Gloriosa AI",
    appTagline: "AI பயிர் நோய் கண்டறிதல்",

    // Navigation
    navHome: "முகப்பு",
    navDetect: "கண்டறி",
    navHistory: "வரலாறு",
    navHelp: "உதவி",
    navProfile: "சுயவிவரம்",

    // Auth — Login
    loginTitle: "உங்கள் கைபேசி எண்ணை உள்ளிடுங்கள்",
    loginSubtext: "நேரடியாக செயலியைத் தொடங்க உங்கள் கைபேசி எண்ணை உள்ளிடவும்.",
    loginPhonePlaceholder: "கைபேசி எண் (10 இலக்கங்கள்)",
    loginSendOTP: "உள்நுழை / தொடங்கு",
    loginSending: "உள்நுழைகிறோம்…",

    // Auth — OTP
    otpTitle: "OTP உள்ளிடுங்கள்",
    otpSubtext: "இந்த எண்ணுக்கு OTP அனுப்பப்பட்டது:",
    otpPlaceholder: "6 இலக்க OTP",
    otpVerify: "சரிபாருங்கள்",
    otpVerifying: "சரிபார்க்கிறோம்…",
    otpResend: "OTP மீண்டும் அனுப்பவும்",
    otpChange: "எண்ணை மாற்றவும்",
    otpMockNote: "சோதனை முறை: OTP எப்போதும் 123456",

    // Home Page
    homeHero: "உங்கள் Gloriosa செடியை சரிபாருங்கள்",
    homeSubtext: "உங்கள் Gloriosa செடியின் புகைப்படத்தை பதிவேற்றி, நோய் மற்றும் தீவிரத்தை உடனடியாக அறியுங்கள்.",
    homeDetectBtn: "நோயைக் கண்டறியவும்",
    homeHowItWorks: "இது எப்படி வேலை செய்கிறது",
    homeWelcomeBack: "வரவேற்கிறோம்!",

    // How It Works steps
    howStep1: "புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்",
    howStep2: "AI படத்தை பகுப்பாய்வு செய்கிறது",
    howStep3: "நோய் முடிவை பெறுங்கள்",
    howStep4: "பரிந்துரைகளை பாருங்கள்",

    // Detect Page
    detectTitle: "பயிர் நோயை கண்டறியவும்",
    detectSubtext: "செடியின் புகைப்படத்தை எவ்வாறு பதிவேற்ற விரும்புகிறீர்கள்?",
    detectTakePhoto: "புகைப்படம் எடுக்கவும்",
    detectUploadPhoto: "புகைப்படத்தை பதிவேற்றவும்",
    detectInstruction: "பாதிக்கப்பட்ட இலை அல்லது செடியின் தெளிவான புகைப்படம் எடுக்கவும்.",
    detectTipTitle: "புகைப்பட குறிப்புகள்",
    detectTip1: "இலை தெளிவாக தெரியும்படி வைக்கவும்",
    detectTip2: "நல்ல வெளிச்சம் பயன்படுத்தவும்",
    detectTip3: "செடியை மையத்தில் வைக்கவும்",
    detectTip4: "மங்கலான அல்லது இருண்ட படங்களை தவிர்க்கவும்",

    // Image Preview
    previewTitle: "புகைப்பட முன்னோட்டம்",
    previewReplace: "புகைப்படத்தை மாற்றவும்",
    previewAnalyze: "பகுப்பாய்வு செய்யவும்",

    // Validation
    validating: "படத்தை சரிபார்க்கிறோம்…",
    notGloriosa: "இந்த படம் Gloriosa superba செடியாக தெரியவில்லை.",
    notGloriosaSubtext: "தயவுசெய்து Gloriosa செடியின் தெளிவான புகைப்படத்தை பதிவேற்றவும்.",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",

    // Loading
    loadingTitle: "உங்கள் செடியை பகுப்பாய்வு செய்கிறோம்…",
    loadingSubtext: "Gloriosa AI படத்தை சரிபார்க்கும் வரை காத்திருங்கள்.",

    // Result Page
    resultTitle: "பகுப்பாய்வு முடிவு",
    resultStatus: "நோய் நிலை",
    resultDisease: "நோய்",
    resultSeverity: "தீவிரம்",
    resultConfidence: "நம்பகத்தன்மை",
    resultWhatMeans: "இது என்னவென்றால்",
    resultWhatMeansText: "இந்த நோயுடன் தொடர்புடைய அறிகுறிகளை செடி காட்டுகிறது. விரைவில் சிகிச்சை அளிக்க பரிந்துரைக்கப்படுகிறது.",
    resultViewRec: "பரிந்துரையை பாருங்கள்",
    resultCheckAgain: "மற்றொரு செடியை சரிபாருங்கள்",

    // Healthy Result
    healthyStatus: "உங்கள் செடி ஆரோக்கியமாக உள்ளது.",
    healthyAdvice: "தொடர்ந்து கவனித்து பராமரிக்கவும்.",

    // Severity Labels
    severityHealthy: "ஆரோக்கியமானது",
    severityMild: "மிதமான",
    severityModerate: "நடுத்தர",
    severitySevere: "கடுமையான",

    // Recommendation Page
    recTitle: "பரிந்துரைக்கப்பட்ட நடவடிக்கை",
    recWhatToDo: "என்ன செய்ய வேண்டும்",
    recTreatment: "சிகிச்சை",
    recMonitor: "கண்காணிக்கவும்",
    recMonitorText: "அருகிலுள்ள செடிகளில் இதே போன்ற அறிகுறிகளை கவனிக்கவும். 3–5 நாட்களுக்குப் பிறகு பரவலை சரிபாருங்கள்.",
    recBackBtn: "முடிவுக்கு திரும்பு",
    recNewCheck: "மற்றொரு செடியை சரிபாருங்கள்",

    // History Page
    historyTitle: "முந்தைய பரிசோதனைகள்",
    historyEmpty: "இதுவரை பரிசோதனை இல்லை. ஒரு செடியை சரிபார்க்கவும்.",
    historyViewDetail: "விவரங்களை பாருங்கள்",

    // History Detail
    historyDetailTitle: "பரிசோதனை விவரங்கள்",

    // Profile Page
    profileTitle: "சுயவிவரம்",
    profilePhone: "தொலைபேசி எண்",
    profileLanguage: "மொழி",
    profileMember: "உறுப்பினர் தொடங்கி",
    profileLastLogin: "கடைசி உள்நுழைவு",
    profileLogout: "வெளியேறு",
    profileTotalChecks: "மொத்த பரிசோதனைகள்",
    profileLanguageSaved: "மொழி சேமிக்கப்பட்டது.",

    // Help Page
    helpTitle: "உதவி",
    helpPhotoTitle: "நல்ல புகைப்படம் எடுப்பது எப்படி",
    helpPhotoStep1: "சட்டத்தில் இலை தெளிவாக தெரியும்படி வைக்கவும்",
    helpPhotoStep2: "போதுமான இயற்கை வெளிச்சம் அல்லது பிரகாசமான வெளிச்சம் பயன்படுத்தவும்",
    helpPhotoStep3: "மங்கலான அல்லது அசைவான புகைப்படங்களை தவிர்க்கவும்",
    helpPhotoStep4: "பாதிக்கப்பட்ட பகுதி தெளிவாக தெரியும்படி வைக்கவும்",
    helpHowWorksTitle: "இந்த அமைப்பு எப்படி வேலை செய்கிறது",
    helpStep1: "புகைப்படம் எடுக்கவும்",
    helpStep2: "AI பகுப்பாய்வு",
    helpStep3: "நோய் கண்டறிதல்",
    helpStep4: "தீவிரம் மதிப்பீடு",
    helpStep5: "பரிந்துரை",
    helpFaqTitle: "பொதுவான கேள்விகள்",
    helpFaq1Q: "இது ஆஃப்லைனில் வேலை செய்யுமா?",
    helpFaq1A: "இல்லை. படத்தை பகுப்பாய்வு செய்ய இணைய இணைப்பு தேவை.",
    helpFaq2Q: "என் புகைப்படம் சேமிக்கப்படுமா?",
    helpFaq2A: "உங்கள் புகைப்படம் பகுப்பாய்விற்கு மட்டும் பயன்படுத்தப்படும். நாங்கள் அதை நிரந்தரமாக வெளியிட மாட்டோம்.",
    helpFaq3Q: "முடிவு எவ்வளவு சரியானது?",
    helpFaq3A: "AI Gloriosa superba வயல் படங்களில் பயிற்சி பெற்றது. முடிவுகள் வழிகாட்டியாகும் — கடுமையான நிகழ்வுகளுக்கு நிபுணரை அணுகவும்.",

    // Errors
    errNoImage: "முதலில் ஒரு புகைப்படத்தை தேர்ந்தெடுக்கவும்.",
    errAnalysis: "இந்த புகைப்படத்தை பகுப்பாய்வு செய்ய முடியவில்லை. வேறு தெளிவான புகைப்படத்தை முயற்சிக்கவும்.",
    errUnavailable: "சேவை தற்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
    errPhone: "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடுங்கள்.",
    errOTP: "OTP தவறானது அல்லது காலாவதியானது. மீண்டும் முயற்சிக்கவும்.",
    errNetwork: "நெட்வொர்க் பிழை. உங்கள் இணைய இணைப்பை சரிபாருங்கள்.",

    // Misc
    speakResult: "முடிவை கேளுங்கள்",
    loading: "ஏற்றுகிறது…",
    back: "திரும்பு",
    close: "மூடு",
    diseaseDetected: "நோய் கண்டறியப்பட்டது",
    noDisease: "நோய் இல்லை",
    analyzing: "பகுப்பாய்வு செய்கிறோம்…",
    saveSuccess: "சேமிக்கப்பட்டது",
    logout: "வெளியேறு",
    logoutConfirm: "வெளியேற விரும்புகிறீர்களா?",
    yes: "ஆம்",
    cancel: "ரத்து செய்",
    date: "தேதி",
    confidence: "நம்பகத்தன்மை",
  },

  // ══════════════════════════════════════════════════════════
  // ENGLISH
  // ══════════════════════════════════════════════════════════
  en: {
    appName: "Gloriosa AI",
    appTagline: "AI Crop Disease Detection",

    navHome: "Home",
    navDetect: "Detect",
    navHistory: "History",
    navHelp: "Help",
    navProfile: "Profile",

    loginTitle: "Enter your phone number",
    loginSubtext: "Enter your 10-digit mobile number to open the app directly.",
    loginPhonePlaceholder: "Phone number (10 digits)",
    loginSendOTP: "Login / Start App",
    loginSending: "Logging in…",

    otpTitle: "Enter OTP",
    otpSubtext: "OTP sent to:",
    otpPlaceholder: "6-digit OTP",
    otpVerify: "Verify",
    otpVerifying: "Verifying…",
    otpResend: "Resend OTP",
    otpChange: "Change number",
    otpMockNote: "Test mode: OTP is always 123456",

    homeHero: "Check Your Gloriosa Plant",
    homeSubtext: "Upload a photo of your Gloriosa plant and instantly check for possible disease and severity.",
    homeDetectBtn: "Detect Disease",
    homeHowItWorks: "How It Works",
    homeWelcomeBack: "Welcome back!",

    howStep1: "Take or upload a photo",
    howStep2: "AI analyzes the image",
    howStep3: "Get disease result",
    howStep4: "See recommendations",

    detectTitle: "Detect Plant Disease",
    detectSubtext: "Choose how you want to upload the plant photo.",
    detectTakePhoto: "Take Photo",
    detectUploadPhoto: "Upload Photo",
    detectInstruction: "Take a clear photo of the affected leaf or plant.",
    detectTipTitle: "Photo Tips",
    detectTip1: "Keep the leaf clearly visible",
    detectTip2: "Use good lighting",
    detectTip3: "Keep the plant centered",
    detectTip4: "Avoid blurry or dark images",

    previewTitle: "Photo Preview",
    previewReplace: "Replace Photo",
    previewAnalyze: "Analyze",

    validating: "Validating image…",
    notGloriosa: "This image does not appear to be a Gloriosa superba plant.",
    notGloriosaSubtext: "Please upload a clear photo of a Gloriosa superba plant.",
    tryAgain: "Try Again",

    loadingTitle: "Analyzing your plant…",
    loadingSubtext: "Please wait while Gloriosa AI checks the image.",

    resultTitle: "Analysis Result",
    resultStatus: "Disease Status",
    resultDisease: "Disease",
    resultSeverity: "Severity",
    resultConfidence: "Confidence",
    resultWhatMeans: "What this means",
    resultWhatMeansText: "The plant shows signs associated with this disease. Early treatment is recommended.",
    resultViewRec: "View Recommendation",
    resultCheckAgain: "Check Another Plant",

    healthyStatus: "Your plant appears healthy.",
    healthyAdvice: "Continue regular monitoring and care.",

    severityHealthy: "Healthy",
    severityMild: "Mild",
    severityModerate: "Moderate",
    severitySevere: "Severe",

    recTitle: "Recommended Action",
    recWhatToDo: "What To Do",
    recTreatment: "Treatment",
    recMonitor: "Monitor",
    recMonitorText: "Watch nearby plants for similar symptoms. Check for spread after 3–5 days.",
    recBackBtn: "Back to Result",
    recNewCheck: "Check Another Plant",

    historyTitle: "Previous Checks",
    historyEmpty: "No history yet. Start by checking a plant.",
    historyViewDetail: "View Details",

    historyDetailTitle: "Analysis Details",

    profileTitle: "Profile",
    profilePhone: "Phone Number",
    profileLanguage: "Language",
    profileMember: "Member Since",
    profileLastLogin: "Last Login",
    profileLogout: "Logout",
    profileTotalChecks: "Total Checks",
    profileLanguageSaved: "Language saved.",

    helpTitle: "Help",
    helpPhotoTitle: "How to Take a Good Photo",
    helpPhotoStep1: "Keep the leaf clearly visible in the frame",
    helpPhotoStep2: "Use enough natural light or bright light",
    helpPhotoStep3: "Avoid blurry or shaky photos",
    helpPhotoStep4: "Keep the affected area clearly visible",
    helpHowWorksTitle: "How the System Works",
    helpStep1: "Take Photo",
    helpStep2: "AI Analysis",
    helpStep3: "Disease Detection",
    helpStep4: "Severity Assessment",
    helpStep5: "Recommendation",
    helpFaqTitle: "Common Questions",
    helpFaq1Q: "Does this work offline?",
    helpFaq1A: "No. An internet connection is needed to analyze the photo.",
    helpFaq2Q: "Is my photo saved?",
    helpFaq2A: "Your photo is only used for analysis. We do not share it publicly.",
    helpFaq3Q: "How accurate is the result?",
    helpFaq3A: "The AI is trained on Gloriosa superba field images. Results are a guide — consult an expert for serious cases.",

    errNoImage: "Please select a photo first.",
    errAnalysis: "We couldn't analyze this photo. Please try another clear photo.",
    errUnavailable: "The analysis service is currently unavailable. Please try again later.",
    errPhone: "Please enter a valid 10-digit phone number.",
    errOTP: "Invalid or expired OTP. Please try again.",
    errNetwork: "Network error. Please check your internet connection.",

    speakResult: "Listen to Result",
    loading: "Loading…",
    back: "Back",
    close: "Close",
    diseaseDetected: "Disease Detected",
    noDisease: "No Disease",
    analyzing: "Analyzing…",
    saveSuccess: "Saved",
    logout: "Logout",
    logoutConfirm: "Do you want to logout?",
    yes: "Yes",
    cancel: "Cancel",
    date: "Date",
    confidence: "Confidence",
  },
};

export default translations;
