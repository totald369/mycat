import type { FaqItem } from "@/lib/seo";

type SeoFaqSectionProps = {
  faqs: FaqItem[];
  title?: string;
  className?: string;
};

export function SeoFaqSection({
  faqs,
  title = "자주 묻는 질문",
  className = "",
}: SeoFaqSectionProps) {
  return (
    <section
      className={className}
      aria-labelledby="seo-faq-heading"
    >
      <h2
        id="seo-faq-heading"
        className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl"
      >
        {title}
      </h2>
      <dl className="mt-4 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="text-base font-semibold leading-snug text-[#171717]">
              <span className="mr-1 font-bold text-[#f8620c]">Q.</span>
              {faq.question}
            </dt>
            <dd className="mt-2 text-base leading-7 text-[#333]">
              <span className="mr-1 font-bold text-[#6f4425]">A.</span>
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
