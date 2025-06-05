import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Team = {
    add: string
    cond: string
    image?: string
}

type TeamSwitcherProps = React.HTMLAttributes<HTMLDivElement>

export function TeamSwitcher({ className }: TeamSwitcherProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedTeam, setSelectedTeam] = React.useState<Team>({
        add: "Alameda Rio Negro 1084",
        cond: "Livo App",
    })

    const teams: Team[] = [
        {
            add: "personal",
            cond: "Personal Account",
        },
        {
            add: "acme-inc",
            cond: "Acme Inc",
            image: "/placeholder.svg?height=40&width=40",
        },
        {
            add: "monsters-inc",
            cond: "Monsters Inc",
            image: "/placeholder.svg?height=40&width=40",
        },
        {
            add: "stark-industries",
            cond: "Stark Industries",
            image: "/placeholder.svg?height=40&width=40",
        },
    ]

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam(team)
        setOpen(false)
    }

    return (
        <div className={className}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select a team"
                        className="w-[200px] justify-between bg-white text-black shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] flex items-center p-4 py-2 rounded-xl"
                    >
                        <span className="truncate text-start">{selectedTeam.cond} <br /> {selectedTeam.add}</span>
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                        {teams.map((team) => (
                            <div
                                key={team.cond}
                                className={cn(
                                    "flex cursor-pointer text-white items-center gap-2 px-3 py-2 hover:bg-accent",
                                    selectedTeam.cond === team.cond && "bg-accent/50",
                                )}
                                onClick={() => handleTeamSelect(team)}
                            >
                                <span className="text-light">{team.cond}</span>
                                {selectedTeam.cond === team.cond && <Check className="h-4 w-4" />}
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
