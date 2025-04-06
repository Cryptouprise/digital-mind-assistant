
import * as React from "react"

const MOBILE_BREAKPOINT = 768 // md breakpoint in Tailwind

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    handleResize()
    
    // Modern event listener
    mql.addEventListener("change", handleResize)
    window.addEventListener("resize", handleResize)
    
    return () => {
      mql.removeEventListener("change", handleResize)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

export function useBreakpoint(breakpoint: number) {
  const [isBelow, setIsBelow] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint
    }
    return false
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    
    const handleResize = () => {
      setIsBelow(window.innerWidth < breakpoint)
    }
    
    // Initial check
    handleResize()
    
    // Modern event listener
    mql.addEventListener("change", handleResize)
    window.addEventListener("resize", handleResize)
    
    return () => {
      mql.removeEventListener("change", handleResize)
      window.removeEventListener("resize", handleResize)
    }
  }, [breakpoint])

  return isBelow
}
