// Array.flat only available in Node v11+
export const flattenNestedArrayOfDepthOne = (array: any[][]) => [].concat.apply([], array);
