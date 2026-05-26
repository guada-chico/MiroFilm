import { useSettings } from '../context/SettingsContext';
import { getT } from '../i18n';

export function useTranslation() {
  const { settings } = useSettings();
  return getT(settings.language);
}
