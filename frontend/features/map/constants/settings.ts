// Cocoy's Update: Settings for map rest stops
/*

Vin,March 21st: Maybe using a state in the map component works better than exporting global variables like this

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
  */
export function mapRestStopType(types: number[]) {
  return types.map(num => {
    switch (num) {
      case 1:
        return 'gas_station';
      case 2:
        return 'lodging';
      case 3:
        return 'convenience_store';
      default:
        return 'gas_station';
    }
  });
}
export function mapSoundAlertType(id: number) {
  switch (id) {
    case 1:
      return 'standard';
    case 2:
      return 'comical';
    default:
      return 'standard';
  }
}
/**
 *  {id: 1, label: 'Gas Stations'},
  {id: 2, label: 'Hotels'},
  {id: 3, label: 'Convenience Stores'},
 */
