export function checkUpdate(existingData: any, newData: any): string[] {
    const changedProperties: Set<string> = new Set();

    function deepCompare(oldValue: any, newValue: any, path: string) {
        // Ignore MongoDB default fields
        if (path.endsWith('_id') || path.endsWith('__v')) return;
        // Array comparison: check if new array has differences from the old array
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            const differences = findNewArrayValues(oldValue, newValue);
            if (differences.length > 0) {
                changedProperties.add(path);
            }
            return;
        }
        // Nested object comparison
        if (typeof oldValue === 'object' && oldValue !== null && typeof newValue === 'object' && newValue !== null) {
            // Only go through keys present in `newValue`
            Object.keys(newValue).forEach((key) => {
                deepCompare(oldValue[key], newValue[key], `${path}.${key}`);
            });
            return;
        }
        // Primitive comparison
        if (oldValue !== newValue) {
            changedProperties.add(path); // Mark field if values are different
        }
    }

    // Start deep comparison using only fields in `newData`
    Object.keys(newData).forEach((key) => {
        deepCompare(existingData[key], newData[key], key);
    });

    // Convert Set to Array and return with cleaner path names
    return Array.from(changedProperties);
}

// Helper to find new values in `newArray` not present in `oldArray`
export function findNewArrayValues(oldArray: any[], newArray: any[]): any[] {
    return newArray.filter((item) => !oldArray.some((oldItem) => JSON.stringify(oldItem) === JSON.stringify(item)));
}
