
import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, value, onChange, placeholder = '', type = 'text', error }) => {
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <label className="block">
      <span className="text-slate-700 font-medium">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 transition duration-150 ease-in-out ${errorClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
};

export default FormField;
