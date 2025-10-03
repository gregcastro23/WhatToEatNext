/**
 * Service Adapters Index
 *
 * This file exports all service adapters for easy importing throughout the application.
 * These adapters provide a bridge between legacy service implementations and the new
 * modern service architecture.
 */

// Export UnifiedDataAdapter
export {
    default as unifiedDataAdapter,
    type UnifiedDataAdapterInterface
} from './UnifiedDataAdapter';

// Adapter files removed during consolidation - obsolete bridge code

// Export NutritionalDataAdapter
export {
    default as nutritionalDataAdapter,
    type NutritionalDataAdapterInterface
} from './NutritionalDataAdapter';

// Export other adapters as they are created
// export { default as someOtherAdapter } from './SomeOtherAdapter';
