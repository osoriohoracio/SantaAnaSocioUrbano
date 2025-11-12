
import React from 'react';
import type { Option } from '../types';

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, name, value, onChange, options, error }) => {
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <label className="block">
      <span className="text-slate-700 font-medium">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring focus:ring-opacity-50 transition duration-150 ease-in-out ${errorClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
};

export default FormSelect;
