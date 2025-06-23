// Comprehensive form validation utilities
import { useState } from 'react';
export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  },
  // Phone number validation
  phone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) return "Please enter a valid phone number";
    return null;
  },
  // Required field validation
  required: (value, fieldName = "This field") => {
    if (!value || value.toString().trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },
  // Minimum length validation
  minLength: (value, min, fieldName = "This field") => {
    if (!value) return null; // Let required validator handle empty values
    if (value.toString().length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },
  // Maximum length validation
  maxLength: (value, max, fieldName = "This field") => {
    if (!value) return null;
    if (value.toString().length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },
  // Number validation
  number: (value, fieldName = "This field") => {
    if (!value) return null;
    if (isNaN(value)) return `${fieldName} must be a valid number`;
    return null;
  },
  // Positive number validation
  positiveNumber: (value, fieldName = "This field") => {
    const numberError = validators.number(value, fieldName);
    if (numberError) return numberError;
    if (parseFloat(value) <= 0) return `${fieldName} must be greater than 0`;
    return null;
  },
  // Amount validation (for financial fields)
  amount: (value, fieldName = "Amount") => {
    if (!value) return `${fieldName} is required`;
    const numberError = validators.positiveNumber(value, fieldName);
    if (numberError) return numberError;
    if (parseFloat(value) > 10000000) return `${fieldName} cannot exceed ₦10,000,000`;
    return null;
  },
  // Password validation
  password: (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    return null;
  },
  // Confirm password validation
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  },
  // Date validation
  date: (date, fieldName = "Date") => {
    if (!date) return `${fieldName} is required`;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return `Please enter a valid ${fieldName.toLowerCase()}`;
    return null;
  },
  // Future date validation
  futureDate: (date, fieldName = "Date") => {
    const dateError = validators.date(date, fieldName);
    if (dateError) return dateError;
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj <= today) return `${fieldName} must be in the future`;
    return null;
  },
  // Past date validation
  pastDate: (date, fieldName = "Date") => {
    const dateError = validators.date(date, fieldName);
    if (dateError) return dateError;
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) return `${fieldName} cannot be in the future`;
    return null;
  }
};
// Form validation schemas
export const validationSchemas = {
  // Member registration schema
  member: {
    fullname: [
      (value) => validators.required(value, "Full name"),
      (value) => validators.minLength(value, 2, "Full name"),
      (value) => validators.maxLength(value, 100, "Full name")
    ],
    gender: [
      (value) => validators.required(value, "Gender")
    ],
    mobile: [
      (value) => validators.required(value, "Phone number"),
      (value) => validators.phone(value)
    ],
    email: [
      (value) => validators.email(value)
    ],
    address: [
      (value) => validators.maxLength(value, 500, "Address")
    ]
  },
  // Savings schema
  savings: {
    amount: [
      (value) => validators.amount(value, "Savings amount")
    ],
    savings_type: [
      (value) => validators.required(value, "Savings type")
    ],
    payment_type: [
      (value) => validators.required(value, "Payment type")
    ],
    month_paid: [
      (value) => validators.required(value, "Month")
    ]
  },
  // Loan application schema
  loanApplication: {
    amount_requested: [
      (value) => validators.amount(value, "Loan amount")
    ],
    loan_purpose: [
      (value) => validators.required(value, "Loan purpose"),
      (value) => validators.minLength(value, 10, "Loan purpose"),
      (value) => validators.maxLength(value, 500, "Loan purpose")
    ],
    loan_duration: [
      (value) => validators.required(value, "Loan duration"),
      (value) => validators.positiveNumber(value, "Loan duration")
    ],
    guarantor_name: [
      (value) => validators.required(value, "Guarantor name"),
      (value) => validators.minLength(value, 2, "Guarantor name")
    ],
    guarantor_phone: [
      (value) => validators.required(value, "Guarantor phone"),
      (value) => validators.phone(value)
    ]
  },
  // Admin login schema
  adminLogin: {
    email: [
      (value) => validators.required(value, "Email"),
      (value) => validators.email(value)
    ],
    password: [
      (value) => validators.required(value, "Password")
    ]
  }
};
// Validate a single field
export const validateField = (value, fieldValidators) => {
  if (!fieldValidators) return null;
  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};
// Validate entire form
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;
  Object.keys(schema).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldValidators = schema[fieldName];
    const error = validateField(fieldValue, fieldValidators);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });
  return { isValid, errors };
};
// Real-time validation hook
export const useFormValidation = (initialData, schema) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const validateSingleField = (fieldName, value) => {
    const fieldValidators = schema[fieldName];
    const error = validateField(value, fieldValidators);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };
  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Validate if field has been touched
    if (touched[fieldName]) {
      validateSingleField(fieldName, value);
    }
  };
  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    validateSingleField(fieldName, formData[fieldName]);
  };
  const validateAll = () => {
    const { isValid, errors: allErrors } = validateForm(formData, schema);
    setErrors(allErrors);
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(schema).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    return isValid;
  };
  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };
  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};
