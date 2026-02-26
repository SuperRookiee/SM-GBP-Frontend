import {useEffect, useEffectEvent, useState} from "react"
import {useTranslation} from "react-i18next"
import {Button} from "@/components/ui/button"
import ThemeToggleIcon from "@/assets/icons/theme-toggle-icon.svg?react"

// #. 초기 다크모드 상태를 계산
const initDark = () => {
    const theme = localStorage.theme
    return theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
}

const ThemeToggle = () => {
    const { t } = useTranslation();
    const [dark, setDark] = useState(initDark)

    const syncTheme = useEffectEvent((next: boolean) => {
        document.documentElement.classList.toggle("dark", next)
        localStorage.theme = next ? "dark" : "light"
    })

    useEffect(() => {
        syncTheme(dark)
    }, [dark])

    return (
        <Button variant="ghost" size="icon-xs" onClick={() => setDark(dark => !dark)} aria-label={t("sidebar.toggle")}>
            <ThemeToggleIcon className="size-4.5 text-foreground" />
        </Button>
    )
}

export default ThemeToggle;

