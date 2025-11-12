
import React from 'react';
import type { Option } from '../types';

interface FormCheckboxGroupProps {
  legend: string;
  name: string;
  options: Option[];
  checkedValues: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({ legend, name, options, checkedValues, onChange, error }) => {
  return (
    <div role="group" aria-labelledby={`${name}-legend`}>
      <p id={`${name}-legend`} className="text-slate-700 font-medium">{legend}</p>
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={checkedValues.includes(option.value)}
              onChange={onChange}
              className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-slate-600">{option.label}</span>
          </label>
        ))}
      </div>
       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormCheckboxGroup;
