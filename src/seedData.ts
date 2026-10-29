import { BiologyTopic, BiologyNote, QuizQuestion, PdfDocument } from '../types';

export const INITIAL_TOPICS: BiologyTopic[] = [
  {
    id: 'unit-01',
    name: 'உயிரியலுக்கான அறிமுகம்',
    nameEn: 'Introduction to Biology',
    description: 'உயிரின் பண்புகள், உயிரியல் கற்கையின் முக்கியத்துவம் மற்றும் உயிரியல் அமைப்பின் நிலைகள்.',
    order: 1,
  },
  {
    id: 'unit-02',
    name: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை',
    nameEn: 'Chemical and Cellular Basis of Life',
    description: 'உயிரின் இரசாயனக் கூறுகள், உயிர்மூலக்கூறுகள், கலக் கட்டமைப்பு, கல மென்சவ்வு மற்றும் கலப் பிரிவு.',
    order: 2,
  },
  {
    id: 'unit-03',
    name: 'அங்கிகளின் கூர்ப்பும் பல்வகைமையும்',
    nameEn: 'Evolution and Diversity of Organisms',
    description: 'கூர்ப்பு, வகைப்பாடு மற்றும் உயிரினங்களின் பல்வகைமை.',
    order: 3,
  },
  {
    id: 'unit-04',
    name: 'தாவர அமைப்பும் தொழிற்பாடும்',
    nameEn: 'Plant Form and Function',
    description: 'தாவர அமைப்பு, தாவர இழையங்கள், கடத்தல், ஒளிச்சேர்க்கை, சுவாசம் மற்றும் வளர்ச்சி.',
    order: 4,
  },
  {
    id: 'unit-05',
    name: 'விலங்கு அமைப்பும் தொழிற்பாடும்',
    nameEn: 'Animal Form and Function',
    description: 'விலங்கு அமைப்பு மற்றும் மனித உடற்றொழிலியல்: போசணம், கடத்தல், சுவாசம், கழிவகற்றல், ஒருங்கிணைப்பு மற்றும் இனப்பெருக்கம்.',
    order: 5,
  },
  {
    id: 'unit-06',
    name: 'பிறப்புரிமையியல்',
    nameEn: 'Genetics',
    description: 'மரபுரிமை, மெண்டலின் விதிகள், மரபணுக்கள் மற்றும் மரபியல் மாறுபாடுகள்.',
    order: 6,
  },
  {
    id: 'unit-07',
    name: 'மூலக்கூற்று உயிரியலும் மீளச்சேர்க்கை DNA தொழில்நுட்பமும்',
    nameEn: 'Molecular Biology and Recombinant DNA Technology',
    description: 'DNA, RNA, மரபணு வெளிப்பாடு மற்றும் மீளச்சேர்க்கை DNA தொழில்நுட்பம்.',
    order: 7,
  },
  {
    id: 'unit-08',
    name: 'சுற்றாடல் உயிரியல்',
    nameEn: 'Environmental Biology',
    description: 'சூழற்றொகுதிகள், ஆற்றல் ஓட்டம், உயிர்ப் புவிவேதிச் சுழற்சிகள் மற்றும் சுற்றாடல் பாதுகாப்பு.',
    order: 8,
  },
  {
    id: 'unit-09',
    name: 'நுண்ணங்கியியல்',
    nameEn: 'Microbiology',
    description: 'நுண்ணங்கிகளின் வகைகள், பண்புகள், பயன்பாடுகள் மற்றும் நோய்களுடனான தொடர்புகள்.',
    order: 9,
  },
  {
    id: 'unit-10',
    name: 'பிரயோக உயிரியல்',
    nameEn: 'Applied Biology',
    description: 'உயிரியல் அறிவின் விவசாயம், உணவு, சுகாதாரம் மற்றும் தொழில்நுட்பப் பயன்பாடுகள்.',
    order: 10,
  },
];

const LEGACY_TOPIC_LABELS: Array<{ matches: string[]; canonical: string }> = [
  { matches: ['cell biology', 'கல உயிரியல்'], canonical: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)' },
  { matches: ['plant biology', 'தாவர உயிரியல்'], canonical: 'தாவர அமைப்பும் தொழிற்பாடும் (Plant Form and Function)' },
  { matches: ['animal biology', 'விலங்கு உயிரியல்'], canonical: 'விலங்கு அமைப்பும் தொழிற்பாடும் (Animal Form and Function)' },
  { matches: ['genetics', 'மரபியல்'], canonical: 'பிறப்புரிமையியல் (Genetics)' },
  { matches: ['ecology', 'சூழலியல்'], canonical: 'சுற்றாடல் உயிரியல் (Environmental Biology)' },
  { matches: ['evolution', 'கூர்ப்பு'], canonical: 'அங்கிகளின் கூர்ப்பும் பல்வகைமையும் (Evolution and Diversity of Organisms)' },
  { matches: ['microbiology', 'நுண்ணுயிரியல்'], canonical: 'நுண்ணங்கியியல் (Microbiology)' },
  { matches: ['applied biology', 'பிரயோக உயிரியல்'], canonical: 'பிரயோக உயிரியல் (Applied Biology)' },
];

export function normalizeTopicLabel(topic: string): string {
  const lower = topic.toLocaleLowerCase();
  const match = LEGACY_TOPIC_LABELS.find((entry) =>
    entry.matches.some((label) => lower.includes(label.toLocaleLowerCase()))
  );
  return match?.canonical ?? topic;
}


export const INITIAL_NOTES: BiologyNote[] = [
  {
    id: 'note-cell-membrane',
    title: 'கல மென்சவ்வின் திரவ மொசைக் மாதிரி (Fluid Mosaic Model)',
    topic: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)',
    subtopic: 'கலக் கட்டமைப்பு (Cell Structure)',
    content: `## 1. அறிமுகம் (Introduction)
1972 இல் சிங்கர் (Singer) மற்றும் நிக்கல்சன் (Nicolson) ஆகியோரால் முன்வைக்கப்பட்ட **திரவ மொசைக் மாதிரி (Fluid Mosaic Model)** கல மென்சவ்வின் கட்டமைப்பை மிகத் துல்லியமாக விளக்குகிறது.

## 2. அடிப்படை கட்டமைப்பு (Basic Structure)
கல மென்சவ்வு பிரதானமாக பின்வரும் கூறுகளால் ஆனது:
1. **பொஸ்போலிப்பிட்டு ஈரடுக்கு (Phospholipid Bilayer):**
   - **நீர்நாட்டமுடைய தலை (Hydrophilic head):** பொஸ்பேற்று கூட்டத்தைக் கொண்டுள்ளது. இது புற மற்றும் அக நீர் ஊடகத்தை நோக்கி அமையும்.
   - **நீர்வெறுக்கும் வால் (Hydrophobic tail):** இரு கொழுப்பு அமிலச் சங்கிலிகளைக் கொண்டுள்ளது. இது உள்ளகப் பகுதியை நோக்கி ஒன்றுக்கொன்று எதிர்கொள்ளும்.

2. **புரதங்கள் (Membrane Proteins):**
   - **ஒருங்கிணைந்த புரதங்கள் (Integral proteins):** மென்சவ்வின் கொழுப்பு ஈரடுக்கினுள் பகுதியாகவோ அல்லது முழுமையாகவோ (Transmembrane proteins) புதைந்து காணப்படும். (எ.கா: கால்வாய் புரதங்கள் - Channel proteins).
   - **புறப் புரதங்கள் (Peripheral proteins):** மென்சவ்வின் மேற்பரப்பில் தளர்வாக இணைக்கப்பட்டிருக்கும்.

3. **கொலஸ்திரோல் (Cholesterol):**
   - விலங்குக் கல மென்சவ்வில் காணப்பட்டு, மென்சவ்வின் திரவத்தன்மையை (Membrane fluidity) மற்றும் நிலைத்தன்மையை கட்டுப்படுத்துகிறது.

4. **கிளைக்கோபுரதங்கள் மற்றும் கிளைக்கோலிப்பிட்டுக்கள் (Glycoproteins & Glycolipids):**
   - கல அங்கீகாரத்திற்கு (Cell-cell recognition) மற்றும் வாங்கிகளாக (Receptors) தொழிற்படுகின்றன.

## 3. முக்கிய தொழில்கள் (Key Functions)
- தெரிவுசெய்து உட்புகவிடும் மென்சவ்வாக (Selectively permeable membrane) தொழிற்பட்டு பதார்த்தங்களின் போக்குவரத்தைக் கட்டுப்படுத்துதல்.
- கலத்தின் உள்ளக சூழலைப் பேணுதல் (Homeostasis).
- சமிக்ஞை கடத்துகை (Signal transduction).`,
    authorId: 'system_admin',
    authorName: 'BioTutor Teacher',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-25T10:00:00.000Z',
  },
  {
    id: 'note-photosynthesis-c3-c4',
    title: 'ஒளிச்சேர்க்கை: C3 மற்றும் C4 தாவரங்களுக்கு இடையிலான ஒப்பீடு (C3 vs C4 Plants)',
    topic: 'தாவர அமைப்பும் தொழிற்பாடும் (Plant Form and Function)',
    subtopic: 'ஒளிச்சேர்க்கை (Photosynthesis)',
    content: `## 1. அறிமுகம் (Overview)
தாவரங்களில் காபன் நிலைநிறுத்தலின் (Carbon fixation) முதன்மை விளைபொருளின் அடிப்படையில் தாவரங்கள் C3 மற்றும் C4 என வகைப்படுத்தப்படுகின்றன.

## 2. ஒப்பீட்டு அட்டவணை (Comparison Table)
| பண்பு (Feature) | C3 தாவரங்கள் (C3 Plants) | C4 தாவரங்கள் (C4 Plants) |
|---|---|---|
| **முதன்மை CO2 வாங்கி (Primary CO2 Acceptor)** | RuBP (Ribulose 1,5-bisphosphate) | PEP (Phosphoenolpyruvate) |
| **முதன்மை நொதியம் (Primary Enzyme)** | RuBisCO | PEP carboxylase |
| **முதல் நிலையான சேர்வை (First Stable Product)** | 3-PGA (3-Phosphoglyceric acid, 3-Carbon) | OAA (Oxaloacetate, 4-Carbon) |
| **இலை உடற்கூற்றியல் (Leaf Anatomy)** | சாதாரண இலைக்கட்டமைப்பு | கிரான்ஸ் கட்டமைப்பு (Kranz anatomy) |
| **ஒளிச்சுவாசம் (Photorespiration)** | உயர்வாகக் காணப்படும் (High) | மிகக் குறைவு அல்லது இல்லை (Negligible) |
| **உகந்த வெப்பநிலை (Optimum Temperature)** | 15°C - 25°C | 30°C - 45°C |
| **உதாரணங்கள் (Examples)** | நெல் (Rice), கோதுமை (Wheat), சோயா (Soybean) | சோளம் (Maize), கரும்பு (Sugarcane), புல் வகைகள் |

## 3. கிரான்ஸ் கட்டமைப்பின் முக்கியத்துவம் (Kranz Anatomy)
C4 தாவரங்களில் கற்றைமடல் கலங்கள் (Bundle sheath cells) மற்றும் நடுவிழையக் கலங்கள் (Mesophyll cells) என இரு வேறு கலங்களில் கல்வின் வட்டம் (Calvin cycle) மற்றும் CO2 நிலைநிறுத்தம் பிரிக்கப்பட்டுள்ளதால் RuBisCO நொதியம் O2 உடன் இணைவது தடுக்கப்பட்டு ஒளிச்சுவாசம் குறைக்கப்பட்டு விளைதிறன் அதிகரிக்கப்படுகிறது.`,
    authorId: 'system_admin',
    authorName: 'BioTutor Teacher',
    createdAt: '2026-10-26T11:30:00.000Z',
    updatedAt: '2026-10-26T11:30:00.000Z',
  },
  {
    id: 'note-mendelian-genetics',
    title: 'மெண்டலின் மரபியல் விதிகளும் மரபுரிமையும் (Mendelian Laws of Inheritance)',
    topic: 'பிறப்புரிமையியல் (Genetics)',
    subtopic: 'பாரம்பரிய மரபியல் (Classical Genetics)',
    content: `## 1. கிரிகர் மெண்டலின் விதிகள் (Mendel's Laws)
மரபியலின் தந்தை என அழைக்கப்படும் கிரிகர் ஜொகான் மெண்டல் (Gregor Johann Mendel) பட்டாணித் தாவரங்களை (Pisum sativum) பயன்படுத்தி மரபுரிமை விதிகளினை நிறுவினார்.

### முதல் விதி: சமவல்லுருக்களின் பிரிவின் விதி (Law of Segregation)
- ஓர் அங்கியில் ஒரு இயல்புக்கான இரு காரணிகள் (Alleles) உள்ளன.
- புணரி உருவாக்கத்தின் போது (Gamete formation) இப்பாரம்பரியக் காரணிகள் பிரிகையடைந்து, ஒவ்வொரு புணரியும் ஒரே ஒரு காரணியை மாத்திரமே பெறும்.
- ஒருபண்புக் கலப்பில் (Monohybrid cross) F2 சந்ததியில் தோற்றவமைப்பு விகிதம் **3 : 1** (Phenotypic ratio) ஆகவும், பிறப்புரிமையமைப்பு விகிதம் **1 : 2 : 1** (Genotypic ratio) ஆகவும் இருக்கும்.

### இரண்டாம் விதி: சுயாதீனப் பங்கீட்டு விதி (Law of Independent Assortment)
- இரு வேறுபட்ட இயல்புகளுக்கான காரணிகள் புணரிகள் உருவாகும் போது ஒன்றிலிருந்து ஒன்று சுயாதீனமாகப் பங்கீடு அடைகின்றன.
- இருபண்புக் கலப்பில் (Dihybrid cross) F2 சந்ததியில் தோற்றவமைப்பு விகிதம் **9 : 3 : 3 : 1** ஆகும்.
- **குறிப்பு (Limitation):** பிணைப்புற்ற மரபணுக்கள் (Linked genes) இவ்விதிக்கு கட்டுப்படுவதில்லை.`,
    authorId: 'system_admin',
    authorName: 'BioTutor Teacher',
    createdAt: '2026-10-27T08:15:00.000Z',
    updatedAt: '2026-10-27T08:15:00.000Z',
  },
];

export const INITIAL_PDFS: PdfDocument[] = [
  {
    id: 'pdf-cell-organelles',
    title: 'கலப் புன்னங்கங்களும் அவற்றின் தொழிற்பாடுகளும் (Cell Organelles & Functions)',
    topic: 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)',
    description: 'இழைமணி, பச்சையவுருமணி, கொல்கி உபகரணம், அகவுருச்சிறுவலை ஆகியவற்றின் கட்டமைப்பு மற்றும் தொழிற்பாட்டு ஒப்பீடு.',
    downloadUrl: 'https://archive.org/download/SriLankaBiologySyllabus/CellBiologySummary.pdf',
    fileName: 'CellBiology_Unit1_Summary.pdf',
    fileSize: 1450000,
    extractedText: `கலப் புன்னங்கங்கள் (Cell Organelles):
1. இழைமணி (Mitochondria): கலத்தின் சக்தியகம் (Powerhouse of the cell). இரட்டை மென்சவ்வால் சூழப்பட்டது. உட்புற மென்சவ்வு மடிப்புகள் கிறிஸ்டே (Cristae) எனப்படும். காற்றுச் சுவாசத்தின் கிரெப் வட்டம் மற்றும் இலத்திரன் கடத்தல் சங்கிலி இங்கு நிகழ்கிறது. ATP உற்பத்தி செய்யப்படுகிறது.
2. பச்சையவுருமணி (Chloroplast): ஒளிச்சேர்க்கை நடைபெறும் இடம். தைலகோயிட்டுக்கள் (Thylakoids) மற்றும் பஞ்சணை (Stroma) என்பவற்றை உடையது.
3. கொல்கி உபகரணம் (Golgi apparatus): சுரத்தல், பொதியிடல் மற்றும் கிளைக்கோபுரத தொகுப்பு.
4. அழுத்தமற்ற அகவுருச்சிறுவலை (Smooth ER): லிப்பிட்டு தொகுப்பு மற்றும் நச்சுநீக்கம். அழுத்தமான அகவுருச்சிறுவலை (Rough ER): ரைபோசோம்களைக் கொண்டு புரதத் தொகுப்பில் ஈடுபடுகிறது.`,
    authorId: 'system_admin',
    uploadedAt: '2026-10-26T14:00:00.000Z',
  },
  {
    id: 'pdf-human-digestion',
    title: 'மனித சமிபாட்டுத் தொகுதி - என்சைம்கள் அட்டவணை (Human Digestive Enzymes)',
    topic: 'விலங்கு அமைப்பும் தொழிற்பாடும் (Animal Form and Function)',
    description: 'வாய்க்குழி, இரைப்பை, முன்சிறுகுடல் மற்றும் சிறுகுடலில் சுரக்கப்படும் சமிபாட்டு நொதியங்கள் மற்றும் அவற்றின் உபரிப் பொருட்கள்.',
    downloadUrl: 'https://archive.org/download/SriLankaBiologySyllabus/HumanDigestiveEnzymes.pdf',
    fileName: 'HumanDigestiveSystem_Enzymes.pdf',
    fileSize: 980000,
    extractedText: `மனித சமிபாட்டு நொதியங்கள் (Human Digestive Enzymes):
1. வாய்க்குழி (Oral cavity): உமிழ்நீர் அமைலேசு (Salivary amylase / Ptyalin) - மாப்பொருளை மோல்ற்றோசாக மாற்றுகிறது.
2. இரைப்பை (Stomach): பெப்சின் (Pepsin) - காபோவைதரேற்று அமில சூழலில் (pH 1.5 - 2.5) புரதங்களை பெப்ரோன்களாகவும் பொலிபெப்ரைட்டுகளாகவும் உடைக்கிறது.
3. கணையச் சாறு (Pancreatic juice):
   - டிரிப்சின் (Trypsin) & கைமோடிரிப்சின் (Chymotrypsin): புரதச் சமிபாடு.
   - கணைய அமைலேசு (Pancreatic amylase): மாப்பொருள் சமிபாடு.
   - கணைய லைபேசு (Pancreatic lipase): கொழுப்பை கொழுப்பு அமிலமாகவும் கிளிசரோலாகவும் மாற்றுகிறது.
4. சிறுகுடல் (Small intestine): மோல்ற்றேசு, சுக்குரேசு, லக்ரேசு, எண்டரோகைனேசு.`,
    authorId: 'system_admin',
    uploadedAt: '2026-10-27T09:30:00.000Z',
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
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
    explanation: 'இரு வெவ்வேறு பரம்பரையலகுச் சோடிகள் சுயாதீனமாகப் பங்கீடு அடைவதால் F2 சந்ததியில் 9 : 3 : 3 : 1 தோற்றவமைப்பு விகிதம் (Double dominant, Single dominant 1, Single dominant 2, Double recessive) கிடைக்கிறது.',
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
    explanation: 'இரைப்பையின் உட்குழியப் பரிவு கலங்களால் (Oxyntic / Parietal cells) சுரக்கப்படும் HCl அமிலமானது அமிலச் சூழலை (pH ~ 2) வழங்கி செயலற்ற பெப்சினோஜனை செயலுள்ள பெப்சினாக மாற்றுகிறது.',
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
    explanation: 'காற்றுச் சுவாசத்தில் குளூக்கோசு சிதைவு (Glycolysis) கலச்சாற்றிலும், கிரெப் வட்டம் இழைமணியின் பஞ்சணையிலும் (Mitochondrial Matrix), இலத்திரன் கடத்தல் சங்கிலி உட்புற மென்சவ்விலும் (Cristae) நிகழ்கின்றன.',
  },
];
