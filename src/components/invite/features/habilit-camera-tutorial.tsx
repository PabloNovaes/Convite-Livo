import {
    Carousel,
    CarouselContent,
    CarouselDots,
    CarouselItem
} from "@/components/ui/carousel"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerPortal,
    DrawerTitle
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getOSmodel } from "@/utils/get-os-model"

type TutorialStep = {
    description: string;
    image: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        description: "Abra as configurações do navegador no seu dispositivo.",
        image: getOSmodel() === "Android" ? "assets/tutorial/android/android-step-1.jpg" : "assets/tutorial/ios/ios-step-1.jpg",
    },
    {
        description: getOSmodel() === "Android"
            ? "Acesse as permissões do navegador."
            : 'Vá até "Ajustes do Site".',
        image: getOSmodel() === "Android" ? "assets/tutorial/android/android-step-2.jpg" : "assets/tutorial/ios/ios-step-2.jpg",
    },
    {
        description: getOSmodel() === "Android"
            ? "Marque essa opção para desbloquear o uso da câmera"
            : 'Selecione "Câmera" e clique na opção "Permitir" para desbloquear o uso da câmera.',
        image: getOSmodel() === "Android" ? "assets/tutorial/android/android-step-3.jpg" : "assets/tutorial/ios/ios-step-3.jpg",
    },
];

const TutorialContent = () => (
    <>
        <Carousel className="w-full mx-auto pt-4">
            <CarouselContent className="relative">
                {tutorialSteps.map(({ description, image }, index) => (
                    <CarouselItem key={index + description}>
                        <div className="relative flex justify-center">
                            <p className="absolute text-[13px] text-white/90 bottom-6 w-[80%] px-2 text-center">{description}</p>
                            <img src={image} alt="step-image" width={500} height={300} className="w-full object-cover rounded-lg border" />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="left-0 bottom-2.5 w-full flex justify-center absolute">
                <CarouselDots />
            </div>
        </Carousel>
    </>
)

export function HabilitCameraTutorial({ isOpen = false, changeOpen }: { isOpen: boolean, changeOpen: (isOpen: boolean) => void }) {
    const isMobile = useMediaQuery("(max-width: 640px)")

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={changeOpen}>
                <DrawerPortal>
                    <DrawerContent className="sm:max-w-[500px]">
                        <DrawerHeader>
                            <DrawerTitle className="text-center">Permitir o uso da câmera</DrawerTitle>
                            <DrawerDescription className="text-center">
                                Siga os passos abaixo para poder conceder acesso ao uso da câmera do seu dispositivo durante o cadastro.
                            </DrawerDescription>
                            <TutorialContent />
                        </DrawerHeader>
                    </DrawerContent>
                </DrawerPortal>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={changeOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-center">Permitir o uso da câmera</DialogTitle>
                    <DialogDescription className="text-center">
                        Siga os passos abaixo para poder conceder acesso ao uso da câmera do seu dispositivo durante o cadastro.
                    </DialogDescription>
                </DialogHeader>
                <TutorialContent />
            </DialogContent>
        </Dialog>
    )
}

