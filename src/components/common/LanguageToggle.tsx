import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const nextLang = i18n.language === "ko" ? "en" : "ko";

// #. 언어 전환 클릭 이벤트를 처리한다.
  const onToggle = () => {
    void i18n.changeLanguage(nextLang);
    localStorage.setItem("lang", nextLang);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={onToggle}>
      {nextLang.toUpperCase()}
    </Button>
  );
};

export default LanguageToggle;

