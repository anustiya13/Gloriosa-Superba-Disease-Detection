// pages/Help.jsx
import React, { useState } from "react";
import {
  Sun, Focus, ZapOff, Eye,
  Camera, ScanSearch, Leaf, Award, ChevronDown, ChevronUp
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const FLOW_STEPS = [
  { icon: Camera, labelKey: "helpStep1" },
  { icon: ScanSearch, labelKey: "helpStep2" },
  { icon: Leaf, labelKey: "helpStep3" },
  { icon: Award, labelKey: "helpStep4" },
  { icon: Eye, labelKey: "helpStep5" },
];

function FAQ({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <p className="faq-answer">{answer}</p>}
    </div>
  );
}

/**
 * Help page with photo tips, system flow diagram, and FAQ.
 */
export default function Help() {
  const { t } = useLanguage();

  const photoSteps = [
    { icon: Eye, text: t("helpPhotoStep1") },
    { icon: Sun, text: t("helpPhotoStep2") },
    { icon: Focus, text: t("helpPhotoStep3") },
    { icon: ZapOff, text: t("helpPhotoStep4") },
  ];

  const faqs = [
    { q: t("helpFaq1Q"), a: t("helpFaq1A") },
    { q: t("helpFaq2Q"), a: t("helpFaq2A") },
    { q: t("helpFaq3Q"), a: t("helpFaq3A") },
  ];

  return (
    <main className="page help-page">
      <div className="page-header">
        <h1 className="page-title">{t("helpTitle")}</h1>
      </div>

      {/* ── Photo Tips ────────────────────────────────── */}
      <section className="help-section">
        <h2 className="help-section-title">{t("helpPhotoTitle")}</h2>
        <div className="help-photo-tips">
          {photoSteps.map(({ icon: Icon, text }, i) => (
            <div key={i} className="help-tip-item">
              <div className="help-tip-number">{i + 1}</div>
              <div className="help-tip-icon">
                <Icon size={22} />
              </div>
              <p className="help-tip-text">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works Flow ─────────────────────────── */}
      <section className="help-section">
        <h2 className="help-section-title">{t("helpHowWorksTitle")}</h2>
        <div className="help-flow">
          {FLOW_STEPS.map(({ icon: Icon, labelKey }, i) => (
            <React.Fragment key={i}>
              <div className="help-flow-step">
                <div className="help-flow-icon">
                  <Icon size={24} />
                </div>
                <p className="help-flow-label">{t(labelKey)}</p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="help-flow-arrow" aria-hidden="true">↓</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="help-section">
        <h2 className="help-section-title">{t("helpFaqTitle")}</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <FAQ key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </main>
  );
}
