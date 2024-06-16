// ############################################################################//
//                                                                             //
//    ... перезагрузить z2m, что бы конвертер применился                       //
//                                                                             //
//#############################################################################//


const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const constants = require('zigbee-herdsman-converters/lib/constants');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const e = exposes.presets;
const ea = exposes.access;
const {postfixWithEndpointName} = require('zigbee-herdsman-converters/lib/utils');


const tzLocal = {
	node_config: {
        key: ['reading_interval', 'config_report_enable', 'comparison_previous_data', 'poll_rate_on', 'tx_radio_power'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                reading_interval: ['genPowerCfg', {0x0201: {value, type: 0x21}}],
				config_report_enable: ['genPowerCfg', {0x0275: {value, type: 0x10}}],
				comparison_previous_data: ['genPowerCfg', {0x0205: {value, type: 0x10}}],
				poll_rate_on: ['genPowerCfg', {0x0216: {value, type: 0x10}}],
				tx_radio_power: ['genPowerCfg', {0x0236: {value, type: 0x28}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	termostat_config: {
        key: ['high_temperature', 'low_temperature', 'enable_temperature', 'invert_logic_temperature', 'switching_temperature_sensor'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_temperature: ['msTemperatureMeasurement', {0x0221: {value, type: 0x29}}],
                low_temperature: ['msTemperatureMeasurement', {0x0222: {value, type: 0x29}}],
				enable_temperature: ['msTemperatureMeasurement', {0x0220: {value, type: 0x10}}],
				invert_logic_temperature: ['msTemperatureMeasurement', {0x0225: {value, type: 0x10}}],
				switching_temperature_sensor: ['msTemperatureMeasurement', {0x0229: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	hydrostat_config: {
        key: ['high_humidity', 'low_humidity', 'enable_humidity', 'invert_logichumidity', 'switching_humidity_sensor'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_humidity: ['msRelativeHumidity', {0x0221: {value, type: 0x21}}],
                low_humidity: ['msRelativeHumidity', {0x0222: {value, type: 0x21}}],
				enable_humidity: ['msRelativeHumidity', {0x0220: {value, type: 0x10}}],
				invert_logic_humidity: ['msRelativeHumidity', {0x0225: {value, type: 0x10}}],
				switching_humidity_sensor: ['msRelativeHumidity', {0x0229: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
};

const fzLocal = {
	node_config: {
        cluster: 'genPowerCfg',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0201)) {
                result.reading_interval = msg.data[0x0201];
            }
			if (msg.data.hasOwnProperty(0x0275)) {
				result.config_report_enable = ['OFF', 'ON'][msg.data[0x0275]];
            }
			if (msg.data.hasOwnProperty(0x0205)) {
				result.comparison_previous_data = ['OFF', 'ON'][msg.data[0x0205]];
            }
			if (msg.data.hasOwnProperty(0x0216)) {
                result.poll_rate_on = ['OFF', 'ON'][msg.data[0x0216]];
            }
			if (msg.data.hasOwnProperty(0x0236)) {
                result.tx_radio_power = msg.data[0x0236];
            }
            return result;
        },
    },
	termostat_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_temperature = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_temperature = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_temperature = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_temperature = ['OFF', 'ON'][msg.data[0x0225]];
            }
			if (msg.data.hasOwnProperty(0x0229)) {
                result.switching_temperature_sensor = ['OFF', 'ON'][msg.data[0x0229]];
            }
            return result;
        },
    },
	hydrostat_config: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_humidity = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_humidity = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_humidity = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_humidity = ['OFF', 'ON'][msg.data[0x0225]];
            }
			if (msg.data.hasOwnProperty(0x0229)) {
                result.switching_humidity_sensor = ['OFF', 'ON'][msg.data[0x0229]];
            }
            return result;
        },
    },
	humidity: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
			    const humidity = parseFloat(msg.data['measuredValue']) / 100.0;
			    const prope = postfixWithEndpointName('humidity', msg, model, meta);
				if(prope == 'humidity_2'){
				return {[prope]: humidity};
				}else{
			    return {[prope]: humidity};
				}
			}
        },
    },
	uptime: {
        cluster: 'genTime',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            //return {uptime: Math.round(msg.data.localTime/60)};
			if (msg.data.hasOwnProperty('standardTime')) {
				return {uptime: Math.round(msg.data.standardTime/60/60)};
			}
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_TH_DUO_LR'],
        model: 'EFEKTA_TH_DUO_LR',
        vendor: 'EFEKTALAB',
        description: 'EFEKTA_TH_DUO_LR - Smart device with internal and external temperature and humidity sensor and with a signal amplifier. Thermostat and hygrostat. Self-contained, powered by 2 AAA batteries',
        fromZigbee: [fz.temperature, fzLocal.humidity, fz.battery, fzLocal.node_config, fzLocal.termostat_config, fzLocal.hydrostat_config, fzLocal.uptime],
        toZigbee: [tz.factory_reset, tzLocal.node_config, tzLocal.termostat_config, tzLocal.hydrostat_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            const clusters = ['genTime', 'genPowerCfg', 'msTemperatureMeasurement', 'msRelativeHumidity'];
			await reporting.bind(endpoint, coordinatorEndpoint, clusters);
			const endpoint2 = device.getEndpoint(2);
            const clusters2 = ['msTemperatureMeasurement', 'msRelativeHumidity'];
			await reporting.bind(endpoint2, coordinatorEndpoint, clusters2);
			const overides = {min: 30, max: 900, change: 10};
			const overides2 = {min: 60, max: 900, change: 30};
			const overides3 = {min: 3600, max: 64000, change: 1};
			await reporting.temperature(endpoint, overides);
			await reporting.humidity(endpoint,overides2);
            await reporting.batteryPercentageRemaining(endpoint, overides3);
			await reporting.batteryAlarmState(endpoint, overides3);
			await reporting.temperature(endpoint2, overides);
			await reporting.humidity(endpoint2, overides2);
        },
        icon: 'data:image/jpeg;base64,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AFJzbHRVbnRGI1B4bEBSAAAAAAAAAAAACnZlY3RvckRhdGFib29sAQAAAABQZ1BzZW51bQAAAABQZ1BzAAAAAFBnUEMAAAAATGVmdFVudEYjUmx0AAAAAAAAAAAAAAAAVG9wIFVudEYjUmx0AAAAAAAAAAAAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAAAAAAQY3JvcFdoZW5QcmludGluZ2Jvb2wAAAAADmNyb3BSZWN0Qm90dG9tbG9uZwAAAAAAAAAMY3JvcFJlY3RMZWZ0bG9uZwAAAAAAAAANY3JvcFJlY3RSaWdodGxvbmcAAAAAAAAAC2Nyb3BSZWN0VG9wbG9uZwAAAAAAOEJJTQPtAAAAAAAQAEgAAAABAAEASAAAAAEAAThCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAHjhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAThCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAAjhCSU0EAgAAAAAABgAAAAAAADhCSU0EMAAAAAAAAwEBAQA4QklNBC0AAAAAAAYAAQAAAAg4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADSQAAAAYAAAAAAAAAAAAAAH0AAAB9AAAACgB0AGgAdgAyAF8AcwBoAHQAYwAzAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAB9AAAAfQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABAAAAABAAAAAAAAbnVsbAAAAAIAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABU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IDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA1LTAxVDE0OjMwOjQ5KzAzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTAzLTA2VDE2OjA2OjE5KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wMy0wNlQxNjowNjoxOSswMzowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpkZjY2OWNkYi1iZDliLTk2NDUtODNmNi02NDIzMGY1NjdlOTQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpiNmE5NzQzOC04YzExLTE5NDQtYWNmMi1iZThjNjZmY2Y0YWMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMjFmZmMyZC1lNjRhLTU5NGMtOWFhMi01N2E4MzhlOWM0NDkiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkxlZ2FjeUlQVENEaWdlc3Q9IkNEQ0ZGQTdEQThDN0JFMDkwNTcwNzZBRUFGMDVDMzRFIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0iQWRvYmUgUkdCICgxOTk4KSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDIxZmZjMmQtZTY0YS01OTRjLTlhYTItNTdhODM4ZTljNDQ5IiBzdEV2dDp3aGVuPSIyMDIzLTA1LTAxVDE0OjMwOjQ5KzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjkyMTFiNmNmLWE4NmEtMzM0ZS05ZTM2LTJkMmZiYTFhOTJjNSIgc3RFdnQ6d2hlbj0iMjAyMy0wNS0wMVQxNDozMDo0OSswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS9wbmcgdG8gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzA3NjE3ODgtN2EwYy1jNjRiLTgzNzctNTBiNTY4OGY5MjUxIiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE2VDIzOjI5OjUyKzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjFmZWE0MDAyLWNiNGItNmY0MS05ODIzLWI3MjAwOTFlODZmNSIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMzo1NjoyNiswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmE1YmI5OTlmLTA2ZWEtOWQ0MS1hYjViLWQyY2Y0Mzc2MDk0OSIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMzo1NjoyNiswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkZjY2OWNkYi1iZDliLTk2NDUtODNmNi02NDIzMGY1NjdlOTQiIHN0RXZ0OndoZW49IjIwMjQtMDMtMDZUMTY6MDY6MTkrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MWZlYTQwMDItY2I0Yi02ZjQxLTk4MjMtYjcyMDA5MWU4NmY1IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NDg5ZDI3MTAtZTYxNS1hMTQ1LWFmOTUtZDM1MTZjM2QwMzkwIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MDIxZmZjMmQtZTY0YS01OTRjLTlhYTItNTdhODM4ZTljNDQ5Ii8+IDxwaG90b3Nob3A6VGV4dExheWVycz4gPHJkZjpCYWc+IDxyZGY6bGkgcGhvdG9zaG9wOkxheWVyTmFtZT0iRFVPIiBwaG90b3Nob3A6TGF5ZXJUZXh0PSJEVU8iLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJEVU8iIHBob3Rvc2hvcDpMYXllclRleHQ9IkRVTyIvPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOlRleHRMYXllcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAAC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',
        exposes: [exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
		    e.battery(), e.battery_low(), e.battery_voltage(),
			exposes.binary('config_report_enable', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable reporting based on reporting configuration'),
		    exposes.binary('comparison_previous_data', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable сontrol of comparison with previous data'),
			exposes.numeric('reading_interval', ea.STATE_SET).withUnit('Seconds').withDescription('Setting the sensor reading interval. Setting the time in seconds, by default 30 seconds')
                .withValueMin(15).withValueMax(360),
			exposes.enum('tx_radio_power', ea.STATE_SET, [0, 4, 10, 19]).withDescription('Set TX Radio Power, dbm)'),
			exposes.binary('poll_rate_on', ea.STATE_SET, 'ON', 'OFF').withDescription('Poll rate on off'),
			exposes.numeric('uptime', ea.STATE).withUnit('Hours').withDescription('Uptime'),
			exposes.binary('enable_temperature', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable Temperature Control'),
			exposes.binary('switching_temperature_sensor', ea.STATE_SET, 'ON', 'OFF').withDescription('Internal or external sensor'),
		    exposes.binary('invert_logic_temperature', ea.STATE_SET, 'ON', 'OFF').withDescription('Invert Logic Temperature Control'),
            exposes.numeric('high_temperature', ea.STATE_SET).withUnit('C').withDescription('Setting High Temperature Border')
                .withValueMin(-50).withValueMax(120),
            exposes.numeric('low_temperature', ea.STATE_SET).withUnit('C').withDescription('Setting Low Temperature Border')
                .withValueMin(-50).withValueMax(120),
			exposes.binary('enable_humidity', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable Humidity Control'),
			exposes.binary('switching_humidity_sensor', ea.STATE_SET, 'ON', 'OFF').withDescription('Internal or external sensor'),
		    exposes.binary('invert_logic_humidity', ea.STATE_SET, 'ON', 'OFF').withDescription('Invert Logoc Humidity Control'),
            exposes.numeric('high_humidity', ea.STATE_SET).withUnit('C').withDescription('Setting High Humidity Border')
                .withValueMin(0).withValueMax(99),
            exposes.numeric('low_humidity', ea.STATE_SET).withUnit('C').withDescription('Setting Low Humidity Border')
                .withValueMin(0).withValueMax(99)],
};

module.exports = definition;