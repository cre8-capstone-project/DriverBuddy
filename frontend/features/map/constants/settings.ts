// Cocoy's Update: Settings for map rest stops

// Default values
export let restStopType: string = 'gas_station';
export let restStopCount: number = 3;
export let alertMsgAndSound: string = 'standard';

// Update settings from settings page
export function updateMapSettings(
  newRestStopType: string,
  newRestStopCount: number,
  newAlertMsgAndSound: string,
) {
  restStopType = newRestStopType;
  restStopCount = newRestStopCount;
  alertMsgAndSound = newAlertMsgAndSound;
}
