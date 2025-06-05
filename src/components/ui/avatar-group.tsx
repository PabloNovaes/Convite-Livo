import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
    data: Array<{
        photo: string | null;
        name?: string; // Added name property
    }>;
    size?: number;
    offset?: number;
}



export function AvatarGroup({ data, size = 120, offset = 96 }: AvatarGroupProps) {
    return (
        <TooltipProvider>
            <div className={cn("relative flex items-center justify-center h-[180px] justify-self-center")} style={{ width: `${(size + 6) * data.length}px` }}>
                {data.map(({ photo, name }, index) => (
                    <div
                        key={index}
                        className="absolute"
                        style={{
                            zIndex: index > 0 ? index : 0,
                            left: `calc(50% - ${size}px + ${index * offset}px)`
                        }}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative rounded-full cursor-pointer ring-[6px] ring-ring/20">
                                    <img
                                        src={photo ?? ""}
                                        className={cn("rounded-full object-cover")}
                                        style={{ width: size, height: size }}
                                        alt={name ? `Avatar of ${name}` : `Avatar ${index + 1}`}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="center" className="font-medium">
                                {name || `User ${index + 1}`}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}
            </div>
        </TooltipProvider>
    );
}