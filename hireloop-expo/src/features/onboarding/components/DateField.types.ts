export type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  tone?: 'dark' | 'light';
  minimumDate?: Date;
  maximumDate?: Date;
  presentation?: 'modal' | 'inline';
};
