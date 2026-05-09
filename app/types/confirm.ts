export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  details?: string;
  optionLabel?: string;
  optionDescription?: string;
  optionDefault?: boolean;
}

export interface ConfirmState extends Required<Omit<ConfirmOptions, 'details' | 'optionLabel' | 'optionDescription' | 'optionDefault'>> {
  details?: string;
  optionLabel?: string;
  optionDescription?: string;
  open: boolean;
  loading: boolean;
  optionChecked: boolean;
}

export interface ConfirmResult {
  confirmed: boolean;
  optionChecked: boolean;
}
