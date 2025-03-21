export type SettingsType = {
  id: number;
  restStopRadius: number;
  restStopCount: number;
  alertMsgAndSound: number;
};
export type RestStopsType = {
  id: number;
  settingsId: number;
  stopType: number;
};
