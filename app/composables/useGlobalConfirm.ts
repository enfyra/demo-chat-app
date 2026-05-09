import type { ConfirmOptions, ConfirmResult, ConfirmState } from '~/types/confirm';

const defaultState = (): ConfirmState => ({
  open: false,
  loading: false,
  title: '',
  message: '',
  details: undefined,
  optionLabel: undefined,
  optionDescription: undefined,
  optionChecked: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  destructive: false,
});

const state = ref<ConfirmState>(defaultState());
let resolver: ((value: ConfirmResult) => void) | null = null;

export const useGlobalConfirm = () => {
  const confirm = (options: ConfirmOptions) => {
    if (resolver) {
      resolver({ confirmed: false, optionChecked: false });
    }

    state.value = {
      ...defaultState(),
      ...options,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      destructive: Boolean(options.destructive),
      optionChecked: Boolean(options.optionDefault),
      open: true,
    };

    return new Promise<ConfirmResult>((resolve) => {
      resolver = resolve;
    });
  };

  const close = (value: boolean) => {
    if (state.value.loading) return;
    const optionChecked = state.value.optionChecked;
    state.value.open = false;
    resolver?.({ confirmed: value, optionChecked });
    resolver = null;
  };

  const setLoading = (value: boolean) => {
    state.value.loading = value;
  };

  return {
    state,
    confirm,
    close,
    setLoading,
  };
};
