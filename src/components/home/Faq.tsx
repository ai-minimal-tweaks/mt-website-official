"use client";

import { useId, useState } from "react";
import { faqs } from "@/content/home";
import { Chevron, SectionHeading } from "@/components/ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section className="py-16 sm:py-24" aria-labelledby="faq-title">
      <div className="container-site max-w-[60rem]">
        <div id="faq-title">
          <SectionHeading align="center" lead="We know what's keeping you" accent="worried in finding the right digital partner" />
        </div>

        <div data-anim="stagger" className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                data-anim-item
                className={`rounded-2xl border transition-[background-color,border-color,box-shadow] duration-500 ${
                  isOpen ? "border-line bg-white shadow-[0_24px_50px_-30px_rgba(0,0,0,.3)]" : "border-transparent bg-mist hover:bg-mist-2"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[0.95rem] font-medium sm:px-7 sm:text-base"
                  >
                    {f.q}
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-all duration-500 ease-out-expo ${isOpen ? "rotate-180 bg-ink text-white" : "bg-white"}`}>
                      <Chevron className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${base}-a${i}`}
                  role="region"
                  aria-labelledby={`${base}-q${i}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl px-5 pb-6 font-serif text-[1.02rem] leading-relaxed text-subtle sm:px-7">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </section>
  );
}
