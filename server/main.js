import { Meteor } from 'meteor/meteor';
import '../imports/api/collections.js'

Meteor.startup(() => {
	
	const SerialPort = require('serialport');
	const port = new SerialPort('COM3', {
		baudRate: 57600
	})
	port.on('readable', function () {
		console.log('Data:', port.read())
	})


});

Meteor.methods({
	
});
