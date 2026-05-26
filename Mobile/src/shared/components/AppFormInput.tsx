import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { AppInput, AppInputProps } from './AppInput';

export interface AppFormInputProps<T extends FieldValues> extends Omit<AppInputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export function AppFormInput<T extends FieldValues>({ name, control, ...props }: AppFormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <AppInput
          ref={ref}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
