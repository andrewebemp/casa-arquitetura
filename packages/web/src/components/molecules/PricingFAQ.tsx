'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PRICING_FAQ } from '@decorai/shared';

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Perguntas Frequentes
      </h2>

      <div className="mx-auto max-w-2xl divide-y divide-gray-200 rounded-xl border bg-white">
        {PRICING_FAQ.map((faq, index) => (
          <div key={index}>
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm font-medium text-gray-900">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
