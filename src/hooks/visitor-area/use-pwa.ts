/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [installing, setInstalling] = useState(false)

    const checkIfInstalled = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const isIOS = (window.navigator as any).standalone === true
        return isStandalone || isIOS
    }

    useEffect(() => {
        setIsInstalled(checkIfInstalled())

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setInstalling(false)
            setDeferredPrompt(null)
            setIsInstallable(false)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const install = async () => {
        if (!deferredPrompt) return
        const promptEvent = deferredPrompt as any
        promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice

        if (outcome === 'accepted') {
            setInstalling(true)
        }
        setDeferredPrompt(null)
        setIsInstallable(false)
    }

    useEffect(() => {
        if (isInstalled) {
            setInstalling(false)
        }
    }, [isInstalled])

    return {
        isInstallable,
        isInstalled,
        installing,
        install
    }
}
