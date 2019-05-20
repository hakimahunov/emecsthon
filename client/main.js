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
						data: tasksData,
						size: 150,
						center: [150,30]
					}, {
						type: 'column',
						data: tasksData
					}],
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

Template.trainer.helpers({
	
});