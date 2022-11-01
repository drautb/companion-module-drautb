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

/**
 * Companion instance class for Traffic Light
 */
class TrafficLightInstance extends instance_skel {

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
						type: 'number',
						label: 'Red',
						id: 'red',
						default: 0,
						min: 0,
						max: 255,
						step: 1
					},
					{
						type: 'number',
						label: 'Green',
						id: 'green',
						default: 0,
						min: 0,
						max: 255,
						step: 1
					},
					{
						type: 'number',
						label: 'Blue',
						id: 'blue',
						default: 0,
						min: 0,
						max: 255,
						step: 1
					}
				]
			},
			getColor: {
				label: 'Get Traffic Light Color',
				options: []
			}
		})
	}

	updateFeedbacks() {

	}

	destroy() {
		this.log('info', `Traffic light module instance destroyed: ${this.id}`)
	}
}

module.exports = TrafficLightInstance