export const getOSmodel = () => {
    if (typeof window === 'undefined') return 'Outro'

    const userAgent = navigator.userAgent.toLowerCase();

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    if (/macintosh|windows/i.test(userAgent)) {
        return "desktop";
    }

    if (/iphone/i.test(userAgent)) {
        return "iOS";
    }


    return "Outro";
}