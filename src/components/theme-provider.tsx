"use client"

import { createContext, useContext } from "react"

type CustomThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  return <>{children}</>;
}

export const useTheme = () => ({ theme: 'dark', setTheme: () => {} });
