import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...rest
}, ref) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full rounded-md border text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-gray-300'}
            px-3 py-2 bg-white text-gray-900 placeholder-gray-400
          `}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
