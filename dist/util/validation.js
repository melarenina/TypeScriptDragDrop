export function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) { // Trim() - Removes whitespace from both sides of a string
        isValid = isValid && validatableInput.value.toString().trim().length !== 0; // If the thing after && is false, is valid will be false too
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
//-----------------------------------------VALIDATION------------------------------------------
//# sourceMappingURL=validation.js.map