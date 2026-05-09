export const useTheme = () => {
  const colorMode = useColorMode();
  const theme = computed<'light' | 'dark'>(() => (colorMode.value === 'light' ? 'light' : 'dark'));

  const toggleTheme = () => {
    colorMode.preference = theme.value === 'dark' ? 'light' : 'dark';
  };

  return { theme, toggleTheme };
};
