import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import type {
  PropsWithChildren,
} from 'react'

import {
  useLocation,
} from 'react-router-dom'

import type {
  HelperContext,
} from '../api/types'


export type HelperDisplayState =
  | 'collapsed'
  | 'open'


interface SomacaHelperContextValue {
  context: HelperContext
  displayState: HelperDisplayState
  setDisplayState: (
    state: HelperDisplayState,
  ) => void
  setCurrentPoleId: (
    poleId: number | null,
  ) => void
  setCurrentMachineId: (
    machineId: number | null,
  ) => void
}


const HELPER_DISPLAY_STORAGE_KEY =
  'somaca-helper-display-state'


function getInitialDisplayState():
  HelperDisplayState {
  const stored =
    window.sessionStorage.getItem(
      HELPER_DISPLAY_STORAGE_KEY,
    )

  if (
    stored === 'collapsed'
  ) {
    return stored
  }

  return 'collapsed'
}


const SomacaHelperContext =
  createContext<
    SomacaHelperContextValue | null
  >(null)


export function SomacaHelperContextProvider({
  children,
}: PropsWithChildren) {
  const location =
    useLocation()

  const [
    currentPoleId,
    setCurrentPoleId,
  ] =
    useState<number | null>(
      null,
    )

  const [
    currentMachineId,
    setCurrentMachineId,
  ] =
    useState<number | null>(
      null,
    )

  const [
    displayState,
    setDisplayStateState,
  ] =
    useState<HelperDisplayState>(
      getInitialDisplayState,
    )

  function setDisplayState(
    state: HelperDisplayState,
  ) {
    setDisplayStateState(
      state,
    )

    window.sessionStorage.setItem(
      HELPER_DISPLAY_STORAGE_KEY,
      state === 'open'
        ? 'collapsed'
        : state,
    )
  }

  const context =
    useMemo<HelperContext>(
      () => {
        const onCartography =
          location.pathname
          === '/cartography'

        return {
          current_page:
            location.pathname,
          current_pole_id:
            onCartography
              ? currentPoleId
              : null,
          current_machine_id:
            onCartography
              ? currentMachineId
              : null,
          preferred_language:
            null,
        }
      },
      [
        location.pathname,
        currentPoleId,
        currentMachineId,
      ],
    )

  const value =
    useMemo(
      () => ({
        context,
        displayState,
        setDisplayState,
        setCurrentPoleId,
        setCurrentMachineId,
      }),
      [
        context,
        displayState,
      ],
    )

  return (
    <SomacaHelperContext.Provider
      value={value}
    >
      {children}
    </SomacaHelperContext.Provider>
  )
}


export function useSomacaHelperContext() {
  const value =
    useContext(
      SomacaHelperContext,
    )

  if (!value) {
    throw new Error(
      'useSomacaHelperContext must be used inside SomacaHelperContextProvider.',
    )
  }

  return value
}
