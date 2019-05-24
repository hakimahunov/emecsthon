import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Tasks} from '../imports/api/collections.js';


import './main.html';

Template.chart.onCreated(function helloOnCreated() {
	
});

Template.chart.helpers({
	createChart: function () {
		//setTimeout(function(){
			// Gather data: 
			var allTasks = 20,// (Tasks.find({idd:1}).fetch())[0].count,
			incompleteTask = 13, //Tasks.find({completed: {$eq: false}}).count(),
			tasksData = [{
							y: incompleteTask,
							name: "Incomplete"
						}, {
							y: allTasks - incompleteTask,
							name: "Complete"
						}];
			// Use Meteor.defer() to craete chart after DOM is ready:
			Meteor.defer(function() {
				// Create standard Highcharts chart with options:
				Highcharts.chart('chart', {
					series: [{
						type: 'pie',
						data: tasksData,
						size: 200,
						center: [200,120]
					}/*, {
						type: 'line',
						data: tasksData
					}*/],
					title: {
						text: 'Exercise results'
					},
					colors: ['blue', 'green']
				});
			});
			
		//}, 1000);
	},
	/*createChartX: function () {
		//setTimeout(function(){
			// Gather data: 
			var allTasks = Tasks.find({}).count(),
			incompleteTask = Tasks.find({completed: {$eq: false}}).count(),
			tasksData = [{
							y: incompleteTask,
							name: "Incomplete"
						}, {
							y: allTasks - incompleteTask,
							name: "Complete"
						}];
			// Use Meteor.defer() to craete chart after DOM is ready:
			Meteor.defer(function() {
				// Create standard Highcharts chart with options:
				Highcharts.chart('chart', {
					series: [{
						type: 'pie',
						data: tasksData
					}],
					title: {
						text: 'Exercise results'
					},
					colors: ['blue', 'green']
				});
			});
			
		//}, 1000);
	}*/
});

Template.control.helpers({
	get_count: function(){
		var res = Tasks.find({idd: 1}).fetch();
		return res[0].coords;
		
	}
});
Template.trainer.events({
	'click #btnStart'(event, template) {
		const target = event.target;
		//target.disabled = true;
		
		var task = (Tasks.find({patient:1}).fetch())[0];
		var countDown = task.time;
		var fingers = task.fingers;
		
		for (var i = 0; i < fingers.length; i++) {
			switch (fingers[i]){
				case 1: template.$("#redCirclePinkie").show();
				break;
				case 2: template.$("#redCircleRingFinger").show();
				break;
				case 3: template.$("#redCircleMiddleFinger").show();
				break;
				case 4: template.$("#redCircleForefinger").show();
				break;
				case 5: template.$("#redCircleThumb").show();
				break;
				default:
				break;
			}
		}

		// Update the count down every 1 second
		var x = setInterval(function() {
			
			// Get today's date and time
			this.document.getElementById("counter").innerHTML = countDown;
			countDown--;
			  if (countDown < 0) {
				target.disabled = false;
				this.document.getElementById("redCirclePinkie").src = 'images/green_circle1.png';
				
				clearInterval(x);
			  }
		}, 1000);
		
	}
});