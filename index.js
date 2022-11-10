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

const color = (red, green, blue) => {
	return {
		r: red,
		g: green,
		b: blue
	}
}

const rgbToColor = (rgbVal) => {
	return color((rgbVal >> 16) & 0xff, (rgbVal >> 8) & 0xff, rgbVal & 0xff)
}

const colorToRgb = (color) => {
	return rgb(color.r, color.g, color.b)
}

const GREEN = rgb(0, 255, 0)
const FAKE_YELLOW = rgb(255, 48, 0) // Not really yellow, but this is what 'looks' yellow on the traffic light.
const YELLOW = rgb(255, 255, 0)
const RED = rgb(255, 0, 0)
const BLACK = rgb(0, 0, 0)
const WHITE = rgb(255, 255, 255)

const ICONS = {
	RED_LIGHT: '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',
	YELLOW_LIGHT: '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',
	GREEN_LIGHT: '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',
	STATUS_LIGHT: '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',
	OFF_LIGHT: 'iVBORw0KGgoAAAANSUhEUgAAACcAAABACAYAAACZUm7XAAAABHNCSVQICAgIfAhkiAAADe9JREFUaIHFWnlU08cW/uZH2IMeFa1bEdwAteBCXVjFuhUQcUNwQQSVKqICKrWte59KtRVURN8TUOpSATUgVq1Ciwrqq1pQAUsBkfoKSFjCEhJIfvP+CKEEkhDUd97H4eScuTN3vrmZuctMCNRgqZfX6oqyiq/rG+r7icViWSMh6oaoB6UAISAA9PUNivoN7B/E4/Guq+qucqagdUHz79z5JXG5jw9jZW0F8i6kOoBlWfycng7e5StNs91cbSMiIrK7pWCak/OlwLVr6f8KUqmUznWbQ6dPm35QFQdGlaC2ptpwyBBTjRZCKUVLSwvq6+shlUpBKe1yDMMwMDExwZvKCo6qPhxfL19TyqELdQ109dtaWeDJo1+H6erqqiX07Nkz8C5fQVZWJl7/+RqsVArSOqnztGnw8vaGyRATlTpEIhF6co0mrfvss+0SiQQAA4YBBIL6WrNhZkmcF0V591paWgbp6ekpDBQKhSqVVldXY/eOnbh54wYcpzphpZ8/LC0toG9ggOqqKjx9+gzXr11DXGwsfFf6YlNICFQtVCQWTcl9njtFRk6GhoYGVPEr/WAzdtxfF86f77QnAlavppGHIzq1l7x8SZ0dnehcVzf6NOcplUgkNC83j54/e46eOB5NkxKTaElJCZVKpTTt9m1qP3kK9VrkSQUCQSddq/386YF9+ynLsgrt34SHUyc7hyccPX39vNznuQM6f2+dV1lbWwu/Fb4YPnw4Io8dxfNnz7DAYx7y8/LAStm2s08IoQ6OjmT7zh24lMyDn88KBAWuR0xcLDgcxS1GKVXwBJRS5D7PBcMwj5g+xn1Sbl6/jsbGRkUmHTwHpRR7d+8B18gIR6KOgXf5MpZ5L0Hu8+eUUkoJQ0AIaZvoTkYG5rnPRXFREWJOx+FFfh5iT8Wo2iltKC8rw8P796mp2ZAUZqmb2xmJVFp56JuDak/Zi/wXSL16Ff/Yvw/Zv/2G3Tt3gbIsiIxNRydICCFoaGjA+rXrIJFIsDXsc0RHRaG+vl7lHFKpFHt27QaXa5QdFx+fyngGBAjMzUeuunDuXPOeXbsgEAhaTaU4MOHiRUyeMgWWo0bhH3v2QiqVdhktCCEQCAT024OH4O4xF1wjI1y/9qPSvhXlFdgYFIT0tLQasxHD/IBWP/dDYmLKuPHjvC4lJpU72tlj1Uo/5Ofntw2klCIr8x5mzZ6FnOxsvHjxojsRg9y8cQNCoRCfTJ+OrMxMBeHdjAz4LF2GaU5OeHD/QcmYsdYuiYmJ2QDQtjt/SEy8kpCQkH7mVKxHScnLGRUVbz4B0F9ugc1bwzBx0kQk/HBRU1KQjxWLm/H82XOsCQhAVXWVgry4uKhALBbd+8jqo1sbQ0KSbW1tm+QyhaPj6ekpAHAGwBmrUaNvyMkBwIyZMwAAlfzKbpGTEQTlV1YSO3s7DBw0UEGmRbR+TMvICAaAi0lJCjKV4UuGzgeEa8jtNjkAxJDb/XEqyRFClLk6WI6yhAahsw20dYXmFubvjxxDGOho63Rqt7O3R6/evTQK7jJ2FNZjx2Lw4MHvjxwYInMXHWBgYIDAoPWglHZJsNX7k5DNoW+VD6okJ5VIwLKsUtlyHx+4uLqCUqXffBsxANiwaROm2Noq70TUMehwWttDOS0ZtLS08O3h7zDY5EMSdyoG7TMKyPYY4XK5CNu2DYu9vVRaTbZtVLNTSQ4AWKqaoraODraGhcHL2xspPB5ycnJQV1cPY2NjMnHSRLi7z0Wv3r3UqZfP8nbkmuVFjRqYmJhg/YYNGpDoDEaLUfsVdeHn/r9QazlNIBAI8PjRIxQVFqGhoQE9e/bESPORGD9hAgwMDLpWoO5AeLi77+Hz+b6QsvJUEQBQU1tjrE5naWkpjkRE4MaP18HhcDBsxHBwDbmoqxPgjz8KweFoYd78BQgMWg9jY9WqGC2Ov/2kyQvbt0kpK+o3YEA4h/+mcvuEjz/G6NGj2oQUwJVLl5Qqo5QihZeMr774Ah9ZWyHqRDRs7ezaMlxCCEQiEdLT0nD8WBRcZs7Cwe++hdPUqUr1jRkzxsh5mrNR+7bMzCz8WVq6kyNuac61tLQcvTogQGHQk8ePlTqx+DPxCN+3D19u3w7vpUvw6NdH+HLbNuT8lo1agQDGxsaYYGMDL28v8K6m4EhkJNauCUDksaOYMXNmJ31W1tboOPerV6V4XVqaz9HW0cnMyswcveazgM7+qAO7fz98iPB9+xF+6CCcp01DaHAIUlNSZMLWodVVVSj4/XdcvHABK1b6YktYGHoYGSF0UzAuJ/MwfMQIpRaUg2VZ/PbkCRjCpDG2kycnPnjwgD59+rQTMYb5e7e2tLTgqy++xNLlyzBr9mwErFrdRowQgra/1jqCZVnExcTSsC1bsdLfHw6Ojti5fUeXIS89LQ3l5eVSD/cFl5hDhw/fNjbumxy6KRjl5eVtnbS1tcEwf1vyp5s3wa+sxIZNG3EiOhr/fvhQoaDpiFYZSUlORjKPh7Btn+Pxo0fIyc5RSazg9wLs2r4DJiZDTgaGBBYyADB/0YLVQqHwqbuLK/558iSKi4shbhYrWC71aipc3FwBAHExsWpXr0ASwLEjRzFo8GDYOdjjWmqqglwsFuNFfj6ORERi2ZIl0NHRvbFk+dJgoNXLbN68mT9/0ULbPn2MD56JOy1wd3HFg6z7CkpqqqsxfcYM3M/KQkN9vcZZBiEEpa9eoeD3Anzq4oK6+joF+ffx8XB3dcOF8+f+GjR40GanT5zneHp6NgPtnPCWLVsaAWzNysraefv27ZEpSZdPSSRSG7n83A8XwDAMjkdFaWy19gT/KCjAgoULsWChgktDz549Lvn6+Oy1dXLKs7GxaeHJDxiURIjWAiNnzKjRVbRd4NfS0gIAiEVdx1tlEDeLlVibQCwU/bkhNFTpRlQbW5Wdq4EDO99caIIBAwYqaVV/ctWSU7arJk6a1FpfaF5I6OrpwcraSuP+cnQ7KzEbOhR29vZdLboNlFLMneeBHj16dHeq7pMjhGD7zh0wMDTUqIbo1/8DBIeEdJvYW5EDgKHDhuH4iRMw6mGknGBr8fNB//6IiYtTm5W8d3IAYGdvh+RUmWPmaGuDZVlQSsGyLPQNDLDY2xvJqVdhYWHxtlO8W7L54YcfIvLoUQgEAuTn56O2thZ9+/aFpYUFDAwN30X1u5OTo2fPnpg8efL7UKWA90Ku4757Xw8qnEOHDhln3rljIxYr1J54/bq0y11cVlYG3uUruHf3LgoLC9HU1AQulwtzc3NMmz4dbnPc0KuX+vKQo6tt6jLLZXb7Ni6XSweZDLrDuZyYlFlVVTVSi1E8Gy0tLSoVikQiHDkcgTOnT2OIqSlmzJyBpcuXwbC1hsjLzcP5s2cRfewYVq1ZAx/fFZ0uquVoEjZ5lLws8mjfJpFK0VAvuItxH1n/dTb+e9rY2Kjw77/Sj4bv39/per66upounDefOtja0Vs//UQlEgl9U/GGpqel0WQej967e5fW1NTQ5uZmmpSQSCdYj6Wr/f2pUCjspCsoMJDu3b2709zh+/fT6VOd8znaOjr5L18WD+hYxnE4WkotttrPH6xUiispyairq0Pg2rX4OS0dhBAwDAOWZaGjqwtXN1cEh4bCZuLH8Fvhi5BNwYiKPq6QI8rm0VYoISmlKCwshFDYdI8x7tPn1s0bNzSq7o9ERIDP5+NfcbF4/uwZPNzmIO3WbbAsC5ZlIWm9/BE1NSEpIRHurm5oaGhAzOk4PLx/H2e//77LOWpqapCVmYUhpia3GKvxY08KausEJ6JPqA1Hr1+/RlxsHPZ8/TX4lZVYvy4QQqFQZapOCEEVn49Vviuhr6ePzWFbEXk4Ao0NjUq0/221g+Hh0NfTL94XHp7CHDhwoGb0mFGh0VFRNDrqOJqbm5UOTEpIhIWFBewd7PH1nr0QNTV16TIIIeDz+fju20NYuGgR9PX08OO1a0r7NjY2Yu/u3UjmJUusrMYEmJmZieRX/TGjRo9ae+zokcZPpjrjy8+3obioGPKkiVKKjF9+wacuLiguKsKDBw80f7EmBKlXUyFqEmHGrFnIyMhoL8Tjx4+xJTQUzg6OSLyYwLe2tvKMjY+/DbRzwpeTk09uXLWKV/if/wSlp6dNrK9vsAOogdwCXkuWwMHRAT+n/wx0eK9Syw2y26qcnGwsX+GDVyUl7aQUhQUFgso3b379oP8Ht3xWroz39PRsKwEVnE/kqVMVAL4CgDGyq/5Zctlir8UAgOoqPgghFGqe4JWhrKwcDo6OGDp0qEK7WNwcl3HvbjAApF5XfO7vdlbC0dbu7hAAQMf3XE0IdJuchYUltLS0uh08zc1HdndI98lNnDQRvXr31viqn1IKUzMzjBj5HskxUF4mGBoawsd3RTfKG2DDpo2dIsM7kSOEgKOlPFj7r1oFRycnsGru+ilkVvP08oLbnDndJqaWHMjfhXRHaGtrIyr6OBYuklXvlFLQ1mJR/niixTD4bN067N67563zO5XJJmWp2rRJX18fB775BkuWLkViQiJysrNRX1eHXr17Y8LHNljs5YXhw4e/FakuyQHq3yHksLK2hpW1tcIB0dhSFGqPpEqRkZFR45+lpZpNgrb7OI2JsSyLV6Wl6Nuvn0RVH5WWMzUdEnf7p1seB/btZ8aNH/9OP/7qCMpS3MnIwKuSEtEUe7vzv9y9q7Sf2indPv3Up6ysbAfL0mGk/bEkkD2kEoBo8CnvD9L6KzWGwMBA/6X1+PGhUVFRV1TN/18k3Kput9+f/AAAAABJRU5ErkJggg=='
}

/**
 * Companion instance class for Traffic Light
 */
class TrafficLightInstance extends instance_skel {

	currentColor = color(0, 0, 0)

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
							self.checkFeedbacks('updateBackgroundColor', 'updateAvailableBackgroundColor', 'updateFocusedBackgroundColor', 'updateBusyBackgroundColor')
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
				callback: (feedback) => {
					var self = this
					var background = colorToRgb(self.currentColor)
					if (background == FAKE_YELLOW) {
						background = YELLOW
					}

					return {
						bgcolor: background
					}
				}
			},

			updateAvailableBackgroundColor: {
				type: 'advanced',
				label: 'Update Available Background Color',
				destroy: 'Updates button background color to be avaialbe when traffic light shows available',
				callback: (feedback) => {
					var self = this
					if (colorToRgb(self.currentColor) == GREEN) {
						return {
							bgcolor: GREEN
						}
					}
				}
			},

			updateFocusedBackgroundColor: {
				type: 'advanced',
				label: 'Update Focused Background Color',
				destroy: 'Updates button background color to be focused when traffic light shows focused',
				callback: (feedback) => {
					var self = this
					if (colorToRgb(self.currentColor) == FAKE_YELLOW) {
						return {
							bgcolor: YELLOW
						}
					}
				}
			},

			updateBusyBackgroundColor: {
				type: 'advanced',
				label: 'Update Busy Background Color',
				destroy: 'Updates button background color to be busy when traffic light shows busy',
				callback: (feedback) => {
					var self = this
					if (colorToRgb(self.currentColor) == RED) {
						return {
							bgcolor: RED
						}
					}
				}
			}

		})
	}

	updatePresets() {
		const buildTextPreset = (label, text, color, updateBackgroundFb) => {
			return {
				category: 'Commands',
				label: label,
				bank: {
					style: 'text',
					text: text,
					size: '14',
					color: BLACK,
					bgcolor: WHITE
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: color
						}
					}
				],
				feedbacks: [{ type: updateBackgroundFb }]
			}
		}

		const buildIconPreset = (label, icon, color) => {
			return {
				category: 'Commands',
				label: label,
				bank: {
					style: 'png',
					png64: icon,
					color: WHITE,
					bgcolor: WHITE
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: color
						}
					}
				]
			}
		}


		this.setPresetDefinitions([

			buildIconPreset('Available (Icon)', ICONS.GREEN_LIGHT, GREEN),
			buildIconPreset('Focused (Icon)', ICONS.YELLOW_LIGHT, FAKE_YELLOW),
			buildIconPreset('Busy (Icon)', ICONS.RED_LIGHT, RED),

			{
				category: 'Commands',
				label: 'Status (Icon)',
				bank: {
					style: 'png',
					png64: ICONS.STATUS_LIGHT,
					bgcolor: BLACK
				},
				actions: [{	action: 'getColor' }],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			},

			{
				category: 'Commands',
				label: 'Off (Icon)',
				bank: {
					style: 'png',
					png64: ICONS.OFF_LIGHT,
					bgcolor: WHITE
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: BLACK
						}
					}
				]
			},

			buildTextPreset('Available', 'Available', GREEN, 'updateAvailableBackgroundColor'),
			buildTextPreset('Focused', 'Focused', FAKE_YELLOW, 'updateFocusedBackgroundColor'),
			buildTextPreset('Busy', 'Busy', RED, 'updateBusyBackgroundColor'),

			{
				category: 'Commands',
				label: 'Status',
				bank: {
					style: 'text',
					text: 'Status',
					size: '14',
					color: WHITE,
					bgcolor: BLACK
				},
				actions: [{	action: 'getColor' }],
				feedbacks: [{ type: 'updateBackgroundColor'	}]
			},

			{
				category: 'Commands',
				label: 'Off',
				bank: {
					style: 'text',
					text: 'Off',
					size: '14',
					color: BLACK,
					bgcolor: WHITE
				},
				actions: [
					{
						action: 'changeColor',
						options: {
							color: BLACK
						}
					}
				]
			}

		])
	}

	destroy() {
		this.log('info', `Traffic light module instance destroyed: ${this.id}`)
	}
}

module.exports = TrafficLightInstance