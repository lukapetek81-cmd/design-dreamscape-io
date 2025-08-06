import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use throttled callback for better performance
    const onChange = React.useCallback(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, [])
    
    // Use passive listener for better scroll performance
    mql.addEventListener("change", onChange, { passive: true })
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
