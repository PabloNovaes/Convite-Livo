import { Invite } from "@/components/visitor-area/invite-list"
import { Address, AddressFilterOptions, AllHistoric, Historical } from "./data"

type load_data = {
    payload: {
        addresses: Address[] | null,
        address_filter_options: AddressFilterOptions[] | null,
        allHistoric: AllHistoric[]
        nextInvites: Invite[]
    }
    type: "LOAD_DATA"
}

type set_loading = {
    payload: boolean
    type: "SET_LOADING"
}

type set_current = {
    payload: Address
    type: "SET_CURRENT"
}

type filter_historical = {
    payload: Historical[]
    type: "FILTER_HISTORICAL"
}

export interface InitialStateProps {
    currentAddress: Address | null
    addresses: Address[] | null
    address_filter_options: AddressFilterOptions[] | null,
    allHistoric: AllHistoric[] | null
    nextInvites: Invite[] | null
    filteredHistorical: Historical[] | []
    loading: boolean
}

export type ActionProps = load_data | set_loading | set_current | filter_historical
