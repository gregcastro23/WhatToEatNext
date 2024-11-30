export function getTheme(): string {
  const hour = new Date().getHours();
  const month = new Date().getMonth();

  let theme = 'day';

  if (hour < 6 || hour >= 18) {
    theme = 'night';
  }

  if (month >= 2 && month <= 4) {
    theme += '-spring';
  } else if (month >= 5 && month <= 7) {
    theme += '-summer';
  } else if (month >= 8 && month <= 10) {
    theme += '-fall';
  } else {
    theme += '-winter';
  }

  return theme;
} 