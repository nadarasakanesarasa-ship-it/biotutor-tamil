
import React from 'react';
import { FileText, Download, ShoppingCart, BookOpen } from 'lucide-react';

const pdfs = [
  {
    id: 1,
    title: 'A/L Biology - Cell Biology',
    description: 'கலச்செயலியல் தொடர்பான கற்றல் குறிப்புகள்.',
    price: 150,
    category: 'Biology',
  },
  {
    id: 2,
    title: 'A/L Biology - Genetics',
    description: 'மரபியல் பாடத்திற்கான விரிவான குறிப்புகள்.',
    price: 150,
    category: 'Biology',
  },
  {
    id: 3,
    title: 'A/L Biology - Ecology',
    description: 'சூழலியல் பாடத்திற்கான PDF குறிப்புகள்.',
    price: 150,
    category: 'Biology',
  },
];

export const PDFStore: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4">
          <BookOpen className="w-4 h-4" />
          BioTutor Tamil PDF Store
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          கற்றலுக்கான PDF நூலகம்
        </h1>

        <p className="text-gray-600 mt-3">
          உனக்குத் தேவையான Biology குறிப்புகளைத் தேர்ந்தெடு.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>

            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {pdf.category}
            </span>

            <h2 className="text-lg font-bold text-gray-900 mt-4">
              {pdf.title}
            </h2>

            <p className="text-sm text-gray-500 mt-2 min-h-10">
              {pdf.description}
            </p>

            <div className="flex items-center justify-between mt-6">
              <span className="text-xl font-bold text-emerald-700">
                LKR {pdf.price}
              </span>

              <button
                disabled
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                விரைவில்
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
        <Download className="w-9 h-9 mx-auto mb-3" />

        <h2 className="text-2xl font-bold">
          Complete Biology PDF Bundle
        </h2>

        <p className="mt-2 text-emerald-50">
          அனைத்து முக்கிய Biology குறிப்புகளையும் ஒரே Bundle-ல் பெறலாம்.
        </p>

        <div className="text-3xl font-bold mt-4">
          LKR 800
        </div>

        <button
          disabled
          className="mt-5 px-6 py-3 bg-white/20 rounded-xl font-semibold cursor-not-allowed"
        >
          Payment விரைவில்
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        இவை Demo விலைகள் மட்டுமே. உண்மையான PDF விற்பனை மற்றும்
        Payment வசதி பின்னர் இணைக்கப்படும்.
      </p>
    </div>
  );
};

export default PDFStore;
