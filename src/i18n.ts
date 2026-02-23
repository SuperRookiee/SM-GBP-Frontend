import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/en";
import ko from "@/i18n/ko";

const resources = {
  ko,
  en,
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") ?? "ko",
  fallbackLng: "ko",
  interpolation: { escapeValue: false },
});

export default i18n;
