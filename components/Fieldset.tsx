
import React from 'react';

interface FieldsetProps {
  title: string;
  children: React.ReactNode;
}

const Fieldset: React.FC<FieldsetProps> = ({ title, children }) => {
  return (
    <fieldset className="border border-slate-300 p-4 sm:p-6 rounded-lg mb-8 bg-white shadow-sm break-inside-avoid">
      <legend className="text-lg font-semibold text-slate-800 px-2 -ml-2">
        {title}
      </legend>
      <div className="space-y-6">
        {children}
      </div>
    </fieldset>
  );
};

export default Fieldset;
