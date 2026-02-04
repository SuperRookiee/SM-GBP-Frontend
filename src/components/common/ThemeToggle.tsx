import { useEffect, useEffectEvent, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const initDark = () => {
    const theme = localStorage.theme
    return theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
}

const ThemeToggle = () => {
    const [dark, setDark] = useState(initDark)

    const syncTheme = useEffectEvent((next: boolean) => {
        document.documentElement.classList.toggle("dark", next)
        localStorage.theme = next ? "dark" : "light"
    })

    useEffect(() => {
        syncTheme(dark)
    }, [dark])

    return (
        <Button variant="ghost" size="icon-xs" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
            {dark ? <Moon className="size-4.5"/> : <Sun className="size-4.5"/>}
        </Button>
    )
}

export default ThemeToggle;