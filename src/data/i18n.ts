
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ta: {
    translation: {
      home: 'முகப்பு',
      tutor: 'AI ஆசிரியர்',
      notes: 'குறிப்புகள்',
      pdfs: 'PDF நூலகம்',
      quiz: 'பயிற்சிகள்',
      profile: 'சுயவிவரம்',
      admin: 'நிர்வாகம்',
      login: 'உள்நுழைக',
      logout: 'வெளியேறு',
      guide: 'வழிகாட்டி',
      tagline: 'A/L Biology — தமிழில் கற்போம்',

      welcome: 'வணக்கம்',
      guestTitle: 'உங்கள் கற்றல் பயணத்தைத் தொடங்குங்கள்',
      heroTag: 'உயர்தர உயிரியல் கற்றல் தளம்',
      heroDescription: 'உயிரியல் பாடத்தை எளிமையாகவும் சிறப்பாகவும் கற்றுக்கொள்ளுங்கள்.',
      askTutor: 'AI ஆசிரியரிடம் கேளுங்கள்',
      practiceQuestions: 'வினாக்களைப் பயிற்சி செய்யுங்கள்',
      studentLogin: 'மாணவர் உள்நுழைவு',

      learningProgress: 'கற்றல் முன்னேற்றம்',
      progressDescription: 'உங்கள் கற்றல் செயல்பாடுகளின் விவரம்',
      completedQuizzes: 'முடித்த பயிற்சிகள்',
      averageScore: 'சராசரி மதிப்பெண்',

      aiTutorTitle: 'AI ஆசிரியர்',
      aiTutorDescription: 'உங்கள் சந்தேகங்களுக்கு AI மூலம் விளக்கம் பெறுங்கள்.',
      askQuestion: 'கேள்வி கேளுங்கள்',

      notesTitle: 'பாடக் குறிப்புகள்',
      notesDescription: 'உயிரியல் பாடக் குறிப்புகளைப் படியுங்கள்.',
      notesCount: '{{count}} குறிப்புகள் உள்ளன',

      pdfTitle: 'PDF நூலகம்',
      pdfDescription: 'பாடம் தொடர்பான PDF கோப்புகளைப் பாருங்கள்.',
      pdfCount: '{{count}} PDF கோப்புகள்',

      quizTitle: 'பயிற்சிகள்',
      quizDescription: 'உங்கள் அறிவை வினாக்கள் மூலம் சோதியுங்கள்.',
      practiceNow: 'இப்போது பயிற்சி செய்யுங்கள்',

      biologyUnits: 'உயிரியல் அலகுகள்',
      unitsDescription: 'பாட அலகுகளைத் தேர்ந்தெடுத்துக் கற்றுக்கொள்ளுங்கள்.',
      unit: 'அலகு',
      note: 'குறிப்பு',
      unitNoteCount: '{{count}} குறிப்புகள்',

      recentNotes: 'சமீபத்திய குறிப்புகள்',
      viewAll: 'அனைத்தையும் பார்க்க',
      recentPdfs: 'சமீபத்திய PDF கோப்புகள்',
      goToLibrary: 'நூலகத்திற்குச் செல்லுங்கள்',
      textSearchable: 'தேடக்கூடிய உரை',
      student: 'மாணவர்',
    },
  },

  en: {
    translation: {
      home: 'Home',
      tutor: 'AI Tutor',
      notes: 'Notes',
      pdfs: 'PDF Library',
      quiz: 'Practice',
      profile: 'Profile',
      admin: 'Admin',
      login: 'Sign In',
      logout: 'Log Out',
      guide: 'Guide',
      tagline: 'A/L Biology — Learn with confidence',

      welcome: 'Welcome',
      guestTitle: 'Start your learning journey',
      heroTag: 'Advanced Level Biology Learning Platform',
      heroDescription: 'Learn Biology simply and effectively.',
      askTutor: 'Ask the AI Tutor',
      practiceQuestions: 'Practice Questions',
      studentLogin: 'Student Sign In',

      learningProgress: 'Learning Progress',
      progressDescription: 'Your learning activity overview',
      completedQuizzes: 'Completed Quizzes',
      averageScore: 'Average Score',

      aiTutorTitle: 'AI Tutor',
      aiTutorDescription: 'Get explanations for your questions using AI.',
      askQuestion: 'Ask a Question',

      notesTitle: 'Study Notes',
      notesDescription: 'Explore Biology study notes.',
      notesCount: '{{count}} notes available',

      pdfTitle: 'PDF Library',
      pdfDescription: 'Explore Biology-related PDF files.',
      pdfCount: '{{count}} PDF files',

      quizTitle: 'Practice',
      quizDescription: 'Test your knowledge with questions.',
      practiceNow: 'Practice Now',

      biologyUnits: 'Biology Units',
      unitsDescription: 'Choose a unit and start learning.',
      unit: 'Unit',
      note: 'Note',
      unitNoteCount: '{{count}} notes',

      recentNotes: 'Recent Notes',
      viewAll: 'View All',
      recentPdfs: 'Recent PDF Files',
      goToLibrary: 'Go to Library',
      textSearchable: 'Searchable Text',
      student: 'Student',
    },
  },

  si: {
    translation: {
      home: 'මුල් පිටුව',
      tutor: 'AI ගුරුවරයා',
      notes: 'සටහන්',
      pdfs: 'PDF පුස්තකාලය',
      quiz: 'අභ්‍යාස',
      profile: 'පැතිකඩ',
      admin: 'පරිපාලක',
      login: 'පිවිසෙන්න',
      logout: 'ඉවත් වන්න',
      guide: 'මාර්ගෝපදේශය',
      tagline: 'A/L Biology — සිංහලෙන් ඉගෙන ගනිමු',

      welcome: 'ආයුබෝවන්',
      guestTitle: 'ඔබේ ඉගෙනුම් ගමන ආරම්භ කරන්න',
      heroTag: 'උසස් පෙළ ජීව විද්‍යා ඉගෙනුම් වේදිකාව',
      heroDescription: 'ජීව විද්‍යාව සරලව හා ඵලදායීව ඉගෙන ගන්න.',
      askTutor: 'AI ගුරුවරයාගෙන් අසන්න',
      practiceQuestions: 'ප්‍රශ්න පුහුණු වන්න',
      studentLogin: 'ශිෂ්‍ය පිවිසුම',

      learningProgress: 'ඉගෙනුම් ප්‍රගතිය',
      progressDescription: 'ඔබගේ ඉගෙනුම් ක්‍රියාකාරකම්',
      completedQuizzes: 'සම්පූර්ණ කළ අභ්‍යාස',
      averageScore: 'සාමාන්‍ය ලකුණු',

      aiTutorTitle: 'AI ගුරුවරයා',
      aiTutorDescription: 'ඔබගේ ප්‍රශ්න සඳහා AI මගින් පැහැදිලි කිරීම් ලබාගන්න.',
      askQuestion: 'ප්‍රශ්නයක් අසන්න',

      notesTitle: 'පාඩම් සටහන්',
      notesDescription: 'ජීව විද්‍යා පාඩම් සටහන් කියවන්න.',
      notesCount: 'සටහන් {{count}} ක් ඇත',

      pdfTitle: 'PDF පුස්තකාලය',
      pdfDescription: 'ජීව විද්‍යාවට අදාළ PDF ගොනු බලන්න.',
      pdfCount: 'PDF ගොනු {{count}} ක්',

      quizTitle: 'අභ්‍යාස',
      quizDescription: 'ප්‍රශ්න මගින් ඔබගේ දැනුම පරීක්ෂා කරන්න.',
      practiceNow: 'දැන් පුහුණු වන්න',

      biologyUnits: 'ජීව විද්‍යා ඒකක',
      unitsDescription: 'ඒකකයක් තෝරාගෙන ඉගෙන ගන්න.',
      unit: 'ඒකකය',
      note: 'සටහන',
      unitNoteCount: 'සටහන් {{count}} ක්',

      recentNotes: 'මෑතකාලීන සටහන්',
      viewAll: 'සියල්ල බලන්න',
      recentPdfs: 'மෑතකාලීන PDF ගොනු',
      goToLibrary: 'පුස්තකාලයට යන්න',
      textSearchable: 'සෙවිය හැකි පෙළ',
      student: 'ශිෂ්‍යයා',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
lng: 'en',
fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
