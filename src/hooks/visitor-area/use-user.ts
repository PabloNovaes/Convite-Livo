import { callApi } from "@/api.config";
import { Address, AllHistoric } from "@/types/data";
import { ActionProps, InitialStateProps } from "@/types/use-user";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import cuid from 'cuid';
import { useEffect, useReducer } from "react";
import { useAuth } from "./use-auth";

const reducer = (state: InitialStateProps, action: ActionProps): InitialStateProps => {
    switch (action.type) {
        case "LOAD_DATA": {
            const { addresses, nextInvites, allHistoric, address_filter_options } = action.payload;
            return {
                ...state,
                addresses,
                nextInvites,
                allHistoric,
                address_filter_options
            };
        }
        case "SET_LOADING": {
            return { ...state, loading: action.payload };
        }
        case "SET_CURRENT": {
            return { ...state, currentAddress: action.payload as Address };
        }
        case "FILTER_HISTORICAL": {
            return { ...state, filteredHistorical: action.payload };
        }
        default:
            return state;
    }
};

export function useUser() {
    const { data: user } = useAuth();

    const reloadHistorical = async () => {
        if (!user || !currentAddress) return;

        try {
            const data = await callApi("POST", {
                body: { request: 'get_registros_acessos_visitante', tipo: 2 },
                headers: { Authorization: `Bearer ${user["TOKEN"]}` }
            });

            if (!data.RESULT) return;

            dispatch({
                type: "LOAD_DATA",
                payload: {
                    addresses: addresses ?? [],
                    nextInvites: nextInvites ?? [],
                    address_filter_options: address_filter_options ?? [],
                    allHistoric: data.DADOS as AllHistoric[],
                }
            });
        } catch (err) {
            errorToastDispatcher(err);
        }
    }

    const [
        { addresses, filteredHistorical, loading, currentAddress, nextInvites, allHistoric, address_filter_options },
        dispatch
    ] = useReducer(reducer, {
        addresses: [],
        address_filter_options: [],
        allHistoric: [],
        nextInvites: [],
        filteredHistorical: [],
        loading: false,
        currentAddress: null
    });

    const setCurrentAddress = (payload: Address) => {
        dispatch({ type: "SET_CURRENT", payload });
    };

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                dispatch({ type: "SET_LOADING", payload: true });

                const [
                    recurrent,
                    temporary,
                    allHistoric,
                    nextInvites,
                    allAddress
                ] = await Promise.all([
                    callApi("POST", {
                        body: { request: 'get_autorizacoes_recorrente', tipo: 2 },
                        headers: { Authorization: `Bearer ${user["TOKEN"]}` }
                    }),
                    callApi("POST", {
                        body: { request: 'get_autorizacoes_temporario', tipo: 2 },
                        headers: { Authorization: `Bearer ${user["TOKEN"]}` }
                    }),

                    callApi("POST", {
                        body: { request: 'get_registros_acessos_visitante', tipo: 2 },
                        headers: { Authorization: `Bearer ${user["TOKEN"]}` }
                    }),
                    callApi("POST", {
                        body: { request: 'get_autorizacoes_futuras_visitante', tipo: 2 },
                        headers: { Authorization: `Bearer ${user["TOKEN"]}` }
                    }),
                    callApi("POST", {
                        body: { request: 'get_condominios_visitante', tipo: 2 },
                        headers: { Authorization: `Bearer ${user["TOKEN"]}` }
                    }),
                ]);

                const addresses = [
                    ...(recurrent.RESULT ? recurrent.DADOS.map((item: Address) => ({ ...item, ID: cuid(), RECORRENTE: true })) : []),
                    ...(temporary.RESULT ? temporary.DADOS.map((item: Address) => ({ ...item, ID: cuid(), RECORRENTE: false })) : [])
                ] as Address[]

                dispatch({
                    type: "LOAD_DATA",
                    payload: {
                        nextInvites: nextInvites.DADOS ?? [],
                        allHistoric: allHistoric.DADOS ?? [],
                        address_filter_options: allAddress.DADOS ?? [],
                        addresses,
                    }
                });

                if (addresses.length && !currentAddress) {
                    dispatch({ type: "SET_CURRENT", payload: addresses[0] });
                }
            } catch (err) {
                errorToastDispatcher(err);
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        };

        loadData();
    }, [user]);

    return {
        reloadHistorical,
        loading,
        addresses,
        filteredHistorical,
        address_filter_options,
        allHistoric,
        nextInvites,
        currentAddress,
        setCurrentAddress,
    };
}
