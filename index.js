var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * @param red 0-255
 * @param green 0-255
 * @param blue 0-255
 * @returns RGB value encoded for Companion Bank styling
 */
const rgb = (red, green, blue) => {
  return ((red & 0xff) << 16) | ((green & 0xff) << 8) | (blue & 0xff)
}

const buildColor = (red, green, blue) => {
	return {
		r: red,
		g: green,
		b: blue
	}
}

/**
 * @param rgbVal - value creating using rgb() function.
 * @returns Object containing individual RGB values
 */
const rgbToColor = (rgbVal) => {
	return buildColor((rgbVal >> 16) & 0xff, (rgbVal >> 8) & 0xff, rgbVal & 0xff)
}

/**
 * Companion instance class for Traffic Light
 */
class TrafficLightInstance extends instance_skel {

	currentColor = buildColor(0, 0, 0)

	constructor(system, id, config) {
		super(system, id, config)
		this.system = system
		this.config = config
	}

	/**
	 * Triggered on instance being enabled
	 */
	init() {
		this.log('info', 'Traffic light module loaded')
		this.checkConnection()
		this.updateInstance()
		this.updatePresets()
	}

	checkConnection() {
		var self = this
		self.status(self.STATUS_WARNING, 'Connecting')

		var host = `http://${self.config.host}:${self.config.port}`
		self.log('info', `Attempting to reach traffic light at ${host}`)
		self.system.emit('rest_get', host, function (err, result) {
			if (err !== null) {
				self.log('error', `Error connecting to traffic light (${result.error.code})`);
				self.status(self.STATUS_ERROR, result.error.code);
			} else {
				self.log('info', `Connected to traffic light successfully: ${result.data}`)
				self.status(self.STATUS_OK);
			}
		})
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Traffic Light Host',
				width: 12,
				default: 'rpi-zero-light.local'
			},
			{
				type: 'number',
				id: 'port',
				label: 'Traffic Light Port',
				width: 12,
				default: 5000,
				min: 1,
				max: 65535,
				step: 1
			}
		]
	}

	updateConfig(config) {
		this.log('info', 'Updating config')
		this.config = config;
		this.checkConnection()
	}


	updateInstance() {
		this.log('info', 'Updating instance')
		this.updateActions()
		this.updateFeedbacks()
	}

	updateActions() {
		this.setActions({
			changeColor: {
				label: 'Change Traffic Light Color',
				options: [
					{
						type: 'colorpicker',
						label: 'Color',
						id: 'color',
						default: rgb(0, 0, 0)
					},
				],
				callback: (action) => {
					var self = this
					var url = `http://${self.config.host}:${self.config.port}/color`
					var data = JSON.stringify(rgbToColor(action.options.color))
					self.log('info', `Updating traffic light at ${url} with ${data}`)
					self.system.emit('rest_put', url, data, function (err, result) {
						if (err !== null) {
							self.log('error', `Error updating traffic light (${result.error.code})`);
						} else if (result.response.statusCode !== 200) {
							self.log('error', `Received non-200 response: ${result.response.statusCode} (${result.data})`)
						} else {
							self.log('info', `Updated traffic light successfully: ${JSON.stringify(result.data)}`)
							self.currentColor = result.data
							self.checkFeedbacks('updateBackgroundColor')
						}
					})
				}
			},
			getColor: {
				label: 'Get Traffic Light Color',
				options: [],
				callback: (action) => {
					var self = this
					var url = `http://${self.config.host}:${self.config.port}/color`
					self.log('info', `Getting traffic light color at ${url}`)
					self.system.emit('rest_get', url, function (err, result) {
						if (err !== null) {
							self.log('error', `Error getting traffic light color (${result.error.code})`);
						} else if (result.response.statusCode !== 200) {
							self.log('error', `Received non-200 response: ${result.response.statusCode} (${result.data})`)
						} else {
							self.log('info', `Recived current color successfully: ${JSON.stringify(result.data)}`)
							self.currentColor = result.data
							self.checkFeedbacks('updateBackgroundColor')
						}
					})
				}
			}
		})
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions({
			updateBackgroundColor: {
				type: 'advanced',
				label: 'Update Background Color',
				description: 'Updates button background to match current color of traffic light',
				options: [],
				callback: (feedback) => {
					var self = this
					return {
						bgcolor: rgb(self.currentColor.r, self.currentColor.g, self.currentColor.b)
					}
				}
			}
		})
	}

	updatePresets() {
		this.setPresetDefinitions([
			{
				category: 'Commands',
				label: 'Status',
				bank: {
					style: 'text',
					text: 'Status',
					size: '14',
					color: rgb(255, 255, 255),
					bgcolor: rgb(0, 0, 0)
				},
				actions: [{	action: 'getColor' }],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			},
			{
				category: 'Commands',
				label: 'Busy',
				bank: {
					style: 'text',
					text: 'Busy',
					size: '14',
					color: rgb(255, 255, 255),
					bgcolor: rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: rgb(255, 0, 0)
						}
					}
				],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			},
			{
				category: 'Commands',
				label: 'Focus',
				bank: {
					style: 'text',
					text: 'Focused',
					size: '14',
					color: rgb(255, 255, 255),
					bgcolor: rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: rgb(255, 48, 0)
						}
					}
				],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			},
			{
				category: 'Commands',
				label: 'Available',
				bank: {
					style: 'text',
					text: 'Available',
					size: '14',
					color: rgb(255, 255, 255),
					bgcolor: rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: rgb(0, 255, 0)
						}
					}
				],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			}
		])
	}

	destroy() {
		this.log('info', `Traffic light module instance destroyed: ${this.id}`)
	}
}

module.exports = TrafficLightInstance