import { createContext, useContext } from 'react';

const HideInterfaceContext = createContext(false);

export const HideInterfaceProvider = HideInterfaceContext.Provider;

export function useHideInterface(): boolean {
  return useContext(HideInterfaceContext);
}
