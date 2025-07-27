export * from './helpers/exists';
export * from './helpers/removeReference';

/**
 * Recursively flattens a nested object, concatenating keys with dots.
 * Arrays and Date objects are not traversed.
 * @param obj The object to flatten
 * @param prefix The prefix for nested keys (used internally)
 * @returns A flat object with dot-separated keys
 */
export function flattenObject<
   T extends Record<string, any>,
   R extends Record<string, any> = Record<string, any>
>(obj: T, prefix = ''): R {
   const result = {} as R;
   for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (
         value &&
         typeof value === 'object' &&
         !Array.isArray(value) &&
         !(value instanceof Date)
      ) {
         Object.assign(result, flattenObject(value, newKey));
      } else {
         (result as Record<string, any>)[newKey] = value;
      }
   }
   return result;
}

// Check if value is defined, and reinforce the TS typings.
export const isDefined = <T>(value: T | undefined | null): value is T => {
   return value !== undefined && value !== null;
};
