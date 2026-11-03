
import React from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';

const plans = [
  {
    name: '1 Month Premium',
    price: 300,
    duration: '1 மாதம்',
    description: 'ஒரு மாதத்திற்கு Premium வசதிகள்',
    popular: false,
  },
  {
    name: '3 Months Premium',
    price: 750,
    duration: '3 மாதங்கள்',
    description: 'மூன்று மாதங்களுக்கு Premium வசதிகள்',
    popular: true,
  },
];

const features = [
  'Premium Biology Notes',
  'Exclusive PDF Library',
  'Advanced Practice Questions',
  'Detailed Quiz Explanations',
  'Learning Progress Tracking',
];

export const PremiumPlans: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
          <Crown className="w-4 h-4" />
          BioTutor Tamil Premium
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          உன் கற்றலை அடுத்த நிலைக்கு கொண்டு செல்!
        </h1>

        <p className="text-gray-600 mt-3">
          Premium வசதிகளைப் பயன்படுத்தி உன் கற்றலை மேம்படுத்து.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl border p-7 shadow-sm ${
              plan.popular
                ? 'border-amber-400 ring-2 ring-amber-100'
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                POPULAR
              </span>
            )}

            <h2 className="text-xl font-bold text-gray-900">
              {plan.name}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {plan.description}
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold text-emerald-700">
                LKR {plan.price}
              </span>
              <span className="text-gray-500 ml-2">
                / {plan.duration}
              </span>
            </div>

            <div className="mt-7 space-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full text-center py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Payment விரைவில்
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        இவை ஆரம்பகட்ட Demo விலைகள் மட்டுமே. உண்மையான விலைகள்
        மற்றும் Payment வசதி பின்னர் உறுதிப்படுத்தப்படும்.
      </p>
    </div>
  );
};

export default PremiumPlans;
