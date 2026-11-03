
export interface ServerQuizQuestion {
  id: string;
  question: string;
  topic: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SERVER_QUIZ_QUESTIONS: ServerQuizQuestion[] = [
  {
    id: 'q1',
    question: 'விலங்குக் கல மென்சவ்வின் திரவத்தன்மையை (Membrane fluidity) உகந்த மட்டத்தில் ஒழுங்குபடுத்த உதவும் முக்கிய மூலக்கூறு யாது?',
    topic: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)',
    options: [
      'பொஸ்போலிப்பிட்டு (Phospholipid)',
      'கொலஸ்திரோல் (Cholesterol)',
      'கிளைக்கோபுரதம் (Glycoprotein)',
      'கால்வாய் புரதம் (Channel protein)',
      'சுற்றயல் புரதம் (Peripheral protein)',
    ],
    correctIndex: 1,
    explanation: 'கொலஸ்திரோல் (Cholesterol) மூலக்கூறுகள் பொஸ்போலிப்பிட்டுக்களுக்கு இடையே அமைந்து, குறைந்த வெப்பநிலைகளில் மென்சவ்வு உறைந்து திடமாவதைத் தடுப்பதுடன், உயர் வெப்பநிலைகளில் அதீத திரவத்தன்மை அடைவதையும் கட்டுப்படுத்துகின்றன.',
  },
  {
    id: 'q2',
    question: 'C4 தாவரங்களில் காபனீரொட்சைட்டை (CO2) ஆரம்பத்தில் கவரும் முதன்மை வாங்கி மூலக்கூறு (Primary CO2 Acceptor) மற்றும் அதற்குரிய நொதியம் (Enzyme) எது?',
    topic: 'தாவர அமைப்பும் தொழிற்பாடும் (Plant Form and Function)',
    options: [
      'RuBP மற்றும் RuBisCO',
      'PEP மற்றும் PEP carboxylase',
      'PGA மற்றும் PGA kinase',
      'OAA மற்றும் Malate dehydrogenase',
      'RuBP மற்றும் PEP carboxylase',
    ],
    correctIndex: 1,
    explanation: 'C4 தாவரங்களில் நடுவிழையக் கலங்களில் (Mesophyll cells) உள்ள PEP (Phosphoenolpyruvate) மூலக்கூறு PEP carboxylase நொதியத்தின் முன்னிலையில் CO2 ஐ நிலைநிறுத்தி ஆக்சலோஅசிற்றேற்றை (OAA) உருவாக்குகிறது.',
  },
  {
    id: 'q3',
    question: 'மெண்டலின் இருபண்புக் கலப்பில் (Dihybrid cross) சுயாதீனப் பங்கீட்டு விதிக்கு அமைவாக F2 சந்ததியில் பெறப்படும் தோற்றவமைப்பு விகிதம் (Phenotypic ratio) யாது?',
    topic: 'பிறப்புரிமையியல் (Genetics)',
    options: [
      '3 : 1',
      '1 : 2 : 1',
      '9 : 3 : 3 : 1',
      '9 : 7',
      '1 : 1 : 1 : 1',
    ],
    correctIndex: 2,
    explanation: 'இரு வெவ்வேறு பரம்பரையலகுச் சோடிகள் சுயாதீனமாகப் பங்கீடு அடைவதால் F2 சந்ததியில் 9 : 3 : 3 : 1 தோற்றவமைப்பு விகிதம் கிடைக்கிறது.',
  },
  {
    id: 'q4',
    question: 'மனித இரைப்பையில் பெப்சினோஜன் (Pepsinogen) எனும் செயலற்ற நொதியத்தை செயலுள்ள பெப்சினாக (Pepsin) மாற்றுவதற்கு அவசியமான காரணி எது?',
    topic: 'விலங்கு அமைப்பும் தொழிற்பாடும் (Animal Form and Function)',
    options: [
      'பித்த உப்புக்கள் (Bile salts)',
      'ஐதரோகுளோரிக் அமிலம் (Hydrochloric acid - HCl)',
      'கணையச் சாறு (Pancreatic juice)',
      'உமிழ்நீர் அமைலேசு (Salivary amylase)',
      'மியூசின் (Mucin)',
    ],
    correctIndex: 1,
    explanation: 'இரைப்பையில் HCl அமிலம் அமிலச் சூழலை வழங்கி செயலற்ற பெப்சினோஜனை செயலுள்ள பெப்சினாக மாற்ற உதவுகிறது.',
  },
  {
    id: 'q5',
    question: 'பின்வருவனவற்றுள் எது மெய்க்கருவுள்ள (Eukaryotic) கலங்களில் காற்றுச் சுவாசத்தின் கிரெப் வட்டம் (Krebs cycle) நிகழும் அமைவிடம் ஆகும்?',
    topic: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)',
    options: [
      'கலச்சாறு (Cytosol)',
      'இழைமணியின் பஞ்சணை (Mitochondrial Matrix)',
      'இழைமணியின் கிறிஸ்டே மென்சவ்வு (Cristae membrane)',
      'பச்சையவுருமணியின் பஞ்சணை (Chloroplast stroma)',
      'கொல்கி உடலம் (Golgi body)',
    ],
    correctIndex: 1,
    explanation: 'மெய்க்கருவுள்ள கலங்களில் கிரெப் வட்டம் இழைமணியின் பஞ்சணையில் (Mitochondrial Matrix) நிகழ்கிறது.',
  },
];
