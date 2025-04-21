import {
  runValidationExamples,
  processUserZodiacInput,
  validateUserZodiacData,
  standardizeUserData,
  safelyAccessNestedData,
  createStandardizedData
} from './validationExample';

export {
  runValidationExamples,
  processUserZodiacInput,
  validateUserZodiacData,
  standardizeUserData,
  safelyAccessNestedData,
  createStandardizedData
};

export default {
  validation: {
    runExamples: runValidationExamples,
    processUserZodiacInput,
    validateUserZodiacData,
    standardizeUserData,
    safelyAccessNestedData,
    createStandardizedData
  }
}; 