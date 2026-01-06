import { useState, useCallback } from "react";

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, (value: any) => string | undefined>,
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const [field, rule] of Object.entries(validationRules)) {
      const error = rule(data[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data, validationRules]);

  const handleChange = (name: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return { data, errors, validate, handleChange };
};
