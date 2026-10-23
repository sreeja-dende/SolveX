import { Alert as RNAlert, Platform } from 'react-native';

// Drop-in replacement for Alert.alert that also works on web.
// react-native-web's Alert.alert is a no-op, so confirmations (close challenge,
// select winner, admin actions…) silently did nothing in the browser.
function alert(title, message, buttons) {
  if (Platform.OS !== 'web') return RNAlert.alert(title, message, buttons);

  const text = [title, message].filter(Boolean).join('\n\n');
  const actions = (buttons || []).filter((b) => b.style !== 'cancel');
  const cancel = (buttons || []).find((b) => b.style === 'cancel');

  if (actions.length === 0) {
    window.alert(text);
    return;
  }
  if (actions.length === 1) {
    if (window.confirm(text)) actions[0].onPress?.();
    else cancel?.onPress?.();
    return;
  }
  // Several choices (e.g. Gallery / Camera): ask about each in turn.
  for (const b of actions) {
    if (window.confirm(`${text}\n\n${b.text}?`)) { b.onPress?.(); return; }
  }
  cancel?.onPress?.();
}

export default { alert };
