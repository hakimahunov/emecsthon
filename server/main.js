import { Meteor } from 'meteor/meteor';
import {Tasks} from '../imports/api/collections.js';
import {Train} from '../imports/api/collections.js';
import {ChartData} from '../imports/api/collections.js';
import {FFTRes} from '../imports/api/collections.js';

import brain from 'brain.js';
var net = new brain.NeuralNetwork();
sens_data = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];


Meteor.startup(() => {
	
    const SerialPort = require('serialport');
    var Delimiter = SerialPort.parsers.Delimiter;

    port = null;
    PORT = 'COM8'
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

	
	
	 arr1 = Train.find({className: "palm"},{limit:30}).fetch();
	 arr2 = Train.find({className: "fist"},{limit:30}).fetch();
	 arr3 = Train.find({className: "garbage"},{limit:30}).fetch();
	 res = [];
	 for (var i = 0; i < 3; i++) {
	 	for (var j = 0; j < 30; j++) {
	 		var tmpArr = [];
			if (i == 0) {
				
				for (var k = 0; k < arr1[j].sens_data.length; k++) {
					tmpArr = tmpArr.concat(arr1[j].sens_data[k]);
				}
	 			res.push({input: tmpArr, output: {palm: 1}});
	 		} 
	 		else if (i == 1) {
				for (var k = 0; k < arr2[j].sens_data.length; k++) {
					tmpArr = tmpArr.concat(arr2[j].sens_data[k]);
				}
	 			res.push({input: tmpArr, output: {fist: 1}});
	 			
	 		}
	 		else {
				for (var k = 0; k < arr3[j].sens_data.length; k++) {
					tmpArr = tmpArr.concat(arr3[j].sens_data[k]);
				}
	 			res.push({input: tmpArr, output: {garbage: 1}});
	 			
	 		}
			
	 	}
	 }
	 net.train(res);

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

            sens_data[sens][0] = x/16384.0;
            sens_data[sens][1] = y/16384.0;
            sens_data[sens][2] = z/16384.0;
		}
		
		//tmpArr2 = []
		//for (var k = 0; k < sens_data.length; k++) {
		//	tmpArr2 = tmpArr2.concat(sens_data[k]);
		//}
	 	
		//const output = net.run(tmpArr2);
		//console.log(output);
		//ChartData.insert({time: Date.now(), sens_data: sens_data});
		
		

        

    }
	
	 
	
	 //
	//Meteor.setInterval(function(){
		//console.log(Date.now());
		//Tasks.update({idd: 1},{$inc: {count: 1} })
		//}, 5000)

});

Meteor.methods({
	copy(className){
		var rec = ChartData.find({}).fetch();
		rec = rec[rec.length-1];
		Train.insert({className: className, sens_data: rec.sens_data });
	},
	checkPosition(taskType){
	
		tmpArr2 = []
		for (var k = 0; k < sens_data.length; k++) {
			tmpArr2 = tmpArr2.concat(sens_data[k]);
		}
	 	
		const output = net.run(tmpArr2);
		//console.log(output);
		if (taskType == 2) {
			if (output.fist > 0.80) {
				return "fist"
			} else {
				return "palm"
			}
		}
		//console.log(output);
	},
	
	fft()
    {
        var tmpArr = [];
        data = ChartData.find({}, {sort: {time: -1}, limit: 100}).fetch();
        for (var k = 0; k < 100; k++) {
            tmpArr.push(data[k].sens_data);
        }


        abs_accels = [[],[],[],[],[]];
        for (var i = 0; i < 5; i++)
        {
            for (var k = 0; k < 100; k++)
            {
                abs_accels[i].push(magn_accel(tmpArr[k][i]));
            }
        }
        for (var i = 0; i < 5; i++)
        {
            for (var k = 0; k < 28; k++)
            {
                abs_accels[i].push(0);
            }
        }
        avg_fft = [];
        for (var i = 0; i < 64; i++)
            avg_fft.push(0);

        var fft = new FFT(128, 1000/50);
        for (var i = 0; i < 5; i++)
        {
            fft.forward(abs_accels[i]);
            var spectrum = fft.spectrum;
            for (var k = 0; k < 64; k++)
            {
                avg_fft[k] += spectrum[k]/5;
            }
        }

        FFTRes.insert({time: Date.now(), fft: avg_fft});
    },
	updateTasks(){
		Tasks.update({type:2,completed:false},{$set:{completed:true}});
	}
});

function magn_accel(data)
{
    return Math.sqrt(data[0]*data[0] + data[1]*data[1] + data[2]*data[2]);
}
