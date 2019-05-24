import { Meteor } from 'meteor/meteor';
import {Tasks} from '../imports/api/collections.js';
import {Train} from '../imports/api/collections.js';

Meteor.startup(() => {
	
	const SerialPort = require('serialport');
	const Readline = require('@serialport/parser-readline')
	const port = new SerialPort('COM3', {
		baudRate: 9600
	});
	const parser = new Readline()
	port.pipe(parser)

	//port.on('readable', function () {
	//	console.log('Data:', port.read())
	//})
	import brain from 'brain.js';
	var net = new brain.NeuralNetwork();
	
	arr1 = Train.find({position: "handdown"},{limit:20}).fetch();
	arr2 = Train.find({position: "handup"},{limit:20}).fetch();
	arr3 = Train.find({position: "fingerbend"},{limit:20}).fetch();
	res = [];
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 20; j++) {
			if (i == 0) {
				res.push({input: arr1[j].data, output: {handdown: 1}});
			} 
			else if (i == 1) {
				res.push({input: arr2[j].data, output: {handup: 1}});
			}
			else {
				res.push({input: arr3[j].data, output: {fingerbend: 1}});
			}
			
		}
	}
	//console.log(res);
 
	net.train(res);
	 
	
	
	
	parser.on('data', line => {
		//Tasks.update({idd:1}, {$set:{coords:line.split("|",3)}});
		//Train.insert({position: "fingerbend", data: line.split("|",3)});
		//console.log(++c);
		var output = net.run(line.split("|",3));
		console.log(output);
	});
	
	
	
	//Meteor.setInterval(function(){
		//console.log(Date.now());
		//Tasks.update({idd: 1},{$inc: {count: 1} })
		//}, 5000)


});

Meteor.methods({
	
});
