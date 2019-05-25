import { Meteor } from 'meteor/meteor';
import {Tasks} from '../imports/api/collections.js';
import {Train} from '../imports/api/collections.js';

Meteor.startup(() => {
	
    const SerialPort = require('serialport');
    var Delimiter = SerialPort.parsers.Delimiter;

    port = null;
    PORT = 'COM5'
    // initially we are disconnected
    connect_timer = null;
    is_connected  = false
    onDisconnect();


    // emit disconnect event
    setInterval(function()
    {
        SerialPort.list(function (err, ports) {
            found = false
            ports.forEach(function(port) {
                if (port.comName == PORT)
                {
                    found = true;
                }
            });

            if (port != null)
            {
                if (!found && port.isOpen)
                {
                    port.close();
                    console.log('Close event emitted');
                    onDisconnect();
                }
            }
        });

    }, 1000);

    function reconnect()
    {   
        port = new SerialPort(PORT, {
            baudRate : 500000
        }, function (err) {
              if (err) {
                return console.log('Error: ', err.message)
              }
        });

        sync_pattern  = Buffer.alloc(2);
        sync_pattern[0] = 0x55;
        sync_pattern[1] = 0xAA;
        port.on('open', onConnect);
        var parser = port.pipe(new Delimiter({delimiter: sync_pattern}));
        parser.on('data', onData);


    }

    const NR_SENSORS = 5;

    sens_data = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];

    function onConnect()
    {           
        clearInterval(connect_timer);
        port.flush();
    }

    function onDisconnect()
    {
        console.log('Disconnected')
        connect_timer = setInterval(reconnect, 100);
    }

    function onData(data)
    {   
        if (data.length != 30)
        {
            console.log('mismatch');
            return;
        }

        for (sens = 0; sens < NR_SENSORS; sens++)
        {
            x = data.readInt16LE(sens*6 + 0);
            y = data.readInt16LE(sens*6 + 2);
            z = data.readInt16LE(sens*6 + 4);

            sens_data[sens][0] = x;
            sens_data[sens][1] = y;
            sens_data[sens][2] = z;
        }

        

    }

	// import brain from 'brain.js';
	// var net = new brain.NeuralNetwork();
	
	// arr1 = Train.find({position: "handdown"},{limit:20}).fetch();
	// arr2 = Train.find({position: "handup"},{limit:20}).fetch();
	// arr3 = Train.find({position: "fingerbend"},{limit:20}).fetch();
	// res = [];
	// for (var i = 0; i < 3; i++) {
	// 	for (var j = 0; j < 20; j++) {
	// 		if (i == 0) {
	// 			res.push({input: arr1[j].data, output: {handdown: 1}});
	// 		} 
	// 		else if (i == 1) {
	// 			res.push({input: arr2[j].data, output: {handup: 1}});
	// 		}
	// 		else {
	// 			res.push({input: arr3[j].data, output: {fingerbend: 1}});
	// 		}
			
	// 	}
	// }
	//console.log(res);
 
	// net.train(res);
	 
	//Meteor.setInterval(function(){
		//console.log(Date.now());
		//Tasks.update({idd: 1},{$inc: {count: 1} })
		//}, 5000)

});

Meteor.methods({
	
});
