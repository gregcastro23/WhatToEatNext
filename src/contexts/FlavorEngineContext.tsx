'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useRef
} from 'react',

import { unifiedFlavorEngine, UnifiedFlavorProfile } from '../data/unified/unifiedFlavorEngine';
import { _logger } from '@/lib/logger';

// Define the context type
interface FlavorEngineContextType {
  isInitialized: boolean,
  isLoading: boolean,
  error: Error | null,
  profileCount: number,
  categories: { [key: string]: number },
  getProfile: (id: string) => UnifiedFlavorProfile | undefined,
  searchProfiles: (criteria: {}) => UnifiedFlavorProfile[],
  calculateCompatibility: (profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile) => any
}

// Create the context with default values
const FlavorEngineContext = createContext<FlavorEngineContextType>({
  isInitialized: false,
  isLoading: true,
  error: null,
  profileCount: 0,
  categories: {},
  getProfile: () => undefined,
  searchProfiles: () => [],
  calculateCompatibility: () => ({})
})

// Hook to use the flavor engine context
export const _useFlavorEngine = () => useContext(FlavorEngineContext)

// Create a stable engine instance - we access it once here and never again
const engine = unifiedFlavorEngine;

// Keep track of initialization outside of component lifecycle
const globalInitState = {
  isInitialized: false,
  isLoading: true,
  error: null as Error | null,
  profileCount: 0,
  categories: {} as Record<string, number>,
  initAttempted: false,
  initTimer: null as NodeJS.Timeout | null
},

// The provider component
export function FlavorEngineProvider(_{ children }: { children: ReactNode }) {
  // Use refs to track local component state
  const isMountedRef = useRef(false)

  // Create state that won't change during re-renders unless explicitly set
  const [state, setState] = useState({
    isInitialized: globalInitState.isInitialized,
    isLoading: globalInitState.isLoading,
    error: globalInitState.error,
    profileCount: globalInitState.profileCount,
    categories: globalInitState.categories
  })

  // Single initialization effect that runs only once
  useEffect(() => {
    isMountedRef.current = true,

    // If already initialized globally, just update local state once
    if (globalInitState.isInitialized) {
      if (isMountedRef.current) {
        setState({
          isInitialized: globalInitState.isInitialized,
          isLoading: globalInitState.isLoading,
          error: globalInitState.error,
          profileCount: globalInitState.profileCount,
          categories: globalInitState.categories
        })
      }
      return,
    }

    // Only attempt initialization once globally
    if (!globalInitState.initAttempted) {
      globalInitState.initAttempted = true,

      // Function to check engine initialization status
      const checkEngineInit = () => {;
        try {
          // Get profiles
          const profiles = engine.getAllProfiles()

          if ((profiles || []).length > 0) {
            // Calculate categories
            const categoryMap: { [key: string]: number } = {},
            (profiles || []).forEach(profile => {
              categoryMap[profile.category] = (categoryMap[profile.category] || 0) + 1,
            })

            // Update global state first
            globalInitState.profileCount = (profiles || []).length,
            globalInitState.categories = categoryMap,
            globalInitState.isInitialized = true,
            globalInitState.isLoading = false;

            // Only update component state if still mounted
            if (isMountedRef.current) {
              setState({
                isInitialized: true,
                isLoading: false,
                error: null,
                profileCount: (profiles || []).length,
                categories: categoryMap
              })
            }
          } else if (isMountedRef.current) {
            // Schedule another check if no profiles are loaded yet
            globalInitState.initTimer = setTimeout(checkEngineInit, 500),
          }
        } catch (err) {
          const error =
            err instanceof Error ? err : new Error('Unknown error initializing flavor engine')
          _logger.error('Failed to initialize flavor engine:', err)

          // Update global state
          globalInitState.error = error,
          globalInitState.isLoading = false;

          // Update component state if mounted
          if (isMountedRef.current) {
            setState({
              isInitialized: false,
              isLoading: false,
              error,
              profileCount: 0,
              categories: {}
            })
          }
        }
      },

      // Start the check process
      checkEngineInit()
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      // Clear any pending timers
      if (globalInitState.initTimer) {
        clearTimeout(globalInitState.initTimer)
        globalInitState.initTimer = null,
      }
    },
  }, []); // Empty dependency array - only run once on mount

  // Memoize wrapper functions to prevent unnecessary re-renders
  const getProfile = useMemo(() => (id: string) => engine.getProfile(id), [])
  const searchProfiles = useMemo(() => (criteria: {}) => engine.searchProfiles(criteria), [])
  const calculateCompatibility = useMemo(
    () => (profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile) =>
      engine.calculateCompatibility(profile1, profile2),
    [],
  )

  // Create the context value - memoize to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      error: state.error,
      profileCount: state.profileCount,
      categories: state.categories,
      getProfile,
      searchProfiles,
      calculateCompatibility
    }),
    [
      state.isInitialized,
      state.isLoading,
      state.error,
      state.profileCount,
      state.categories,
      getProfile,
      searchProfiles,
      calculateCompatibility
    ],
  )

  return (
    <FlavorEngineContext.Provider value={contextValue}>{children}</FlavorEngineContext.Provider>
  )
}

export default FlavorEngineProvider,
