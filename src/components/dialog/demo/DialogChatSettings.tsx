import * as React from "react"
import { InfoIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog.tsx'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldTitle, } from '@/components/ui/field.tsx'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, } from '@/components/ui/input-group.tsx'
import { Kbd } from '@/components/ui/kbd.tsx'
import { NativeSelect, NativeSelectOption, } from '@/components/ui/native-select.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue, } from '@/components/ui/select.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip.tsx'

const DialogChatSettings = () => {
    const { t } = useTranslation();
    const [tab, setTab] = React.useState("general")
    const [theme, setTheme] = React.useState("system")
    const [accentColor, setAccentColor] = React.useState("default")
    const [spokenLanguage, setSpokenLanguage] = React.useState("en")
    const [voice, setVoice] = React.useState("samantha")

    const spokenLanguages = [
        { label: t("dialogChat.lang.en"), value: "en" },
        { label: t("dialogChat.lang.es"), value: "es" },
        { label: t("dialogChat.lang.fr"), value: "fr" },
        { label: t("dialogChat.lang.de"), value: "de" },
        { label: t("dialogChat.lang.it"), value: "it" },
        { label: t("dialogChat.lang.pt"), value: "pt" },
        { label: t("dialogChat.lang.ru"), value: "ru" },
        { label: t("dialogChat.lang.zh"), value: "zh" },
        { label: t("dialogChat.lang.ja"), value: "ja" },
        { label: t("dialogChat.lang.ko"), value: "ko" },
        { label: t("dialogChat.lang.ar"), value: "ar" },
        { label: t("dialogChat.lang.hi"), value: "hi" },
        { label: t("dialogChat.lang.bn"), value: "bn" },
        { label: t("dialogChat.lang.te"), value: "te" },
        { label: t("dialogChat.lang.mr"), value: "mr" },
        { label: t("dialogChat.lang.kn"), value: "kn" },
        { label: t("dialogChat.lang.ml"), value: "ml" },
    ];

    const voices = [
        { label: t("dialogChat.voice.samantha"), value: "samantha" },
        { label: t("dialogChat.voice.alex"), value: "alex" },
        { label: t("dialogChat.voice.fred"), value: "fred" },
        { label: t("dialogChat.voice.victoria"), value: "victoria" },
        { label: t("dialogChat.voice.tom"), value: "tom" },
        { label: t("dialogChat.voice.karen"), value: "karen" },
        { label: t("dialogChat.voice.sam"), value: "sam" },
        { label: t("dialogChat.voice.daniel"), value: "daniel" },
    ]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{t("dialogChat.trigger")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("dialogChat.title")}</DialogTitle>
                    <DialogDescription>{t("dialogChat.description")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <NativeSelect value={tab} onChange={(e) => setTab(e.target.value)} className="w-full md:hidden">
                        <NativeSelectOption value="general">{t("dialogChat.tab.general")}</NativeSelectOption>
                        <NativeSelectOption value="notifications">{t("dialogChat.tab.notifications")}</NativeSelectOption>
                        <NativeSelectOption value="personalization">{t("dialogChat.tab.personalization")}</NativeSelectOption>
                        <NativeSelectOption value="security">{t("dialogChat.tab.security")}</NativeSelectOption>
                    </NativeSelect>
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="hidden w-full md:flex">
                            <TabsTrigger value="general">{t("dialogChat.tab.general")}</TabsTrigger>
                            <TabsTrigger value="notifications">{t("dialogChat.tab.notifications")}</TabsTrigger>
                            <TabsTrigger value="personalization">{t("dialogChat.tab.personalization")}</TabsTrigger>
                            <TabsTrigger value="security">{t("dialogChat.tab.security")}</TabsTrigger>
                        </TabsList>
                        <div className="mt-4 rounded-xl border p-6 min-h-135 **:data-[slot=select-trigger]:min-w-31.25">
                            <TabsContent value="general">
                                <FieldSet>
                                    <FieldGroup>
                                        <Field orientation="horizontal">
                                            <FieldLabel htmlFor="theme">{t("dialogChat.general.theme")}</FieldLabel>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger id="theme"><SelectValue placeholder={t("dialogChat.common.select")}/></SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectGroup>
                                                        <SelectItem value="light">{t("dialogChat.general.light")}</SelectItem>
                                                        <SelectItem value="dark">{t("dialogChat.general.dark")}</SelectItem>
                                                        <SelectItem value="system">{t("dialogChat.general.system")}</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <FieldSeparator/>
                                        <Field orientation="horizontal">
                                            <FieldLabel htmlFor="accent-color">{t("dialogChat.general.accent")}</FieldLabel>
                                            <Select value={accentColor} onValueChange={setAccentColor}>
                                                <SelectTrigger id="accent-color"><SelectValue placeholder={t("dialogChat.common.select")}/></SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectGroup>
                                                        <SelectItem value="default"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-neutral-500 dark:bg-neutral-400"/><span>{t("dialogChat.general.default")}</span></div></SelectItem>
                                                        <SelectItem value="red"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-red-500 dark:bg-red-400"/><span>{t("dialogChat.general.red")}</span></div></SelectItem>
                                                        <SelectItem value="blue"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-blue-500 dark:bg-blue-400"/><span>{t("dialogChat.general.blue")}</span></div></SelectItem>
                                                        <SelectItem value="green"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-green-500 dark:bg-green-400"/><span>{t("dialogChat.general.green")}</span></div></SelectItem>
                                                        <SelectItem value="purple"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-purple-500 dark:bg-purple-400"/><span>{t("dialogChat.general.purple")}</span></div></SelectItem>
                                                        <SelectItem value="pink"><div className="flex items-center gap-2"><div className="size-3 rounded-full bg-pink-500 dark:bg-pink-400"/><span>{t("dialogChat.general.pink")}</span></div></SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <FieldSeparator/>
                                        <Field orientation="responsive">
                                            <FieldContent>
                                                <FieldLabel htmlFor="spoken-language">{t("dialogChat.general.spokenLanguage")}</FieldLabel>
                                                <FieldDescription>{t("dialogChat.general.spokenLanguageDesc")}</FieldDescription>
                                            </FieldContent>
                                            <Select value={spokenLanguage} onValueChange={setSpokenLanguage}>
                                                <SelectTrigger id="spoken-language"><SelectValue placeholder={t("dialogChat.common.select")}/></SelectTrigger>
                                                <SelectContent align="end" position="item-aligned">
                                                    <SelectGroup><SelectItem value="auto">{t("dialogChat.general.auto")}</SelectItem></SelectGroup>
                                                    <SelectSeparator/>
                                                    <SelectGroup>
                                                        {spokenLanguages.map((language) => (
                                                            <SelectItem key={language.value} value={language.value}>{language.label}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <FieldSeparator/>
                                        <Field orientation="horizontal">
                                            <FieldLabel htmlFor="voice">{t("dialogChat.general.voice")}</FieldLabel>
                                            <Select value={voice} onValueChange={setVoice}>
                                                <SelectTrigger id="voice"><SelectValue placeholder={t("dialogChat.common.select")}/></SelectTrigger>
                                                <SelectContent align="end" position="item-aligned">
                                                    <SelectGroup>
                                                        {voices.map((voiceItem) => (
                                                            <SelectItem key={voiceItem.value} value={voiceItem.value}>{voiceItem.label}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                            </TabsContent>
                            <TabsContent value="notifications">
                                <FieldGroup>
                                    <FieldSet>
                                        <FieldLabel>{t("dialogChat.notifications.responses")}</FieldLabel>
                                        <FieldDescription>{t("dialogChat.notifications.responsesDesc")}</FieldDescription>
                                        <FieldGroup data-slot="checkbox-group">
                                            <Field orientation="horizontal">
                                                <Checkbox id="push" defaultChecked disabled/>
                                                <FieldLabel htmlFor="push" className="font-normal">{t("dialogChat.notifications.push")}</FieldLabel>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                    <FieldSeparator/>
                                    <FieldSet>
                                        <FieldLabel>{t("dialogChat.notifications.tasks")}</FieldLabel>
                                        <FieldDescription>{t("dialogChat.notifications.tasksDesc")} <a href="#">{t("dialogChat.notifications.manageTasks")}</a></FieldDescription>
                                        <FieldGroup data-slot="checkbox-group">
                                            <Field orientation="horizontal">
                                                <Checkbox id="push-tasks"/>
                                                <FieldLabel htmlFor="push-tasks" className="font-normal">{t("dialogChat.notifications.push")}</FieldLabel>
                                            </Field>
                                            <Field orientation="horizontal">
                                                <Checkbox id="email-tasks"/>
                                                <FieldLabel htmlFor="email-tasks" className="font-normal">{t("dialogChat.notifications.email")}</FieldLabel>
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </FieldGroup>
                            </TabsContent>
                            <TabsContent value="personalization">
                                <FieldGroup>
                                    <Field orientation="responsive">
                                        <FieldLabel htmlFor="nickname">{t("dialogChat.personalization.nickname")}</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput id="nickname" placeholder={t("dialogChat.personalization.nicknamePlaceholder")} className="@md/field-group:max-w-50"/>
                                            <InputGroupAddon align="inline-end">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <InputGroupButton size="icon-xs"><InfoIcon/></InputGroupButton>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="flex items-center gap-2">{t("dialogChat.personalization.nicknameTip")} <Kbd>{t("dialogChat.personalization.nicknameShortcut")}</Kbd></TooltipContent>
                                                </Tooltip>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                    <FieldSeparator/>
                                    <Field orientation="responsive" className="@md/field-group:flex-col @2xl/field-group:flex-row">
                                        <FieldContent>
                                            <FieldLabel htmlFor="about">{t("dialogChat.personalization.moreAbout")}</FieldLabel>
                                            <FieldDescription>{t("dialogChat.personalization.moreAboutDesc")}</FieldDescription>
                                        </FieldContent>
                                        <Textarea id="about" placeholder={t("dialogChat.personalization.aboutPlaceholder")} className="min-h-30 @md/field-group:min-w-full @2xl/field-group:min-w-75"/>
                                    </Field>
                                    <FieldSeparator/>
                                    <FieldLabel>
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldLabel htmlFor="customization">{t("dialogChat.personalization.enableCustom")}</FieldLabel>
                                                <FieldDescription>{t("dialogChat.personalization.enableCustomDesc")}</FieldDescription>
                                            </FieldContent>
                                            <Switch id="customization" defaultChecked/>
                                        </Field>
                                    </FieldLabel>
                                </FieldGroup>
                            </TabsContent>
                            <TabsContent value="security">
                                <FieldGroup>
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldLabel htmlFor="2fa">{t("dialogChat.security.mfa")}</FieldLabel>
                                            <FieldDescription>{t("dialogChat.security.mfaDesc")}</FieldDescription>
                                        </FieldContent>
                                        <Switch id="2fa"/>
                                    </Field>
                                    <FieldSeparator/>
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>{t("dialogChat.security.logout")}</FieldTitle>
                                            <FieldDescription>{t("dialogChat.security.logoutDesc")}</FieldDescription>
                                        </FieldContent>
                                        <Button variant="outline" size="sm">{t("dialogChat.security.logoutButton")}</Button>
                                    </Field>
                                    <FieldSeparator/>
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle>{t("dialogChat.security.logoutAll")}</FieldTitle>
                                            <FieldDescription>{t("dialogChat.security.logoutAllDesc")}</FieldDescription>
                                        </FieldContent>
                                        <Button variant="outline" size="sm">{t("dialogChat.security.logoutAllButton")}</Button>
                                    </Field>
                                </FieldGroup>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DialogChatSettings;

