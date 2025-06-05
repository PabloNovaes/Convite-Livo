import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

export function ErrorDialog({ errorMessage, open, changeOpen }: { errorMessage: string, open: boolean, changeOpen: (open: boolean) => void }) {

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>An error occurred</DialogTitle>
                    <DialogDescription>
                        The application encountered an unexpected error. Please find the details below:
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 h-[200px] w-full rounded-md border p-4 overflow-auto bg-[#121212]">
                    <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">
                        {errorMessage}
                    </pre>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => changeOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}