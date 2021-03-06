import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Tasks} from '../imports/api/collections.js';
import {FFTRes} from '../imports/api/collections.js';
import { Session } from 'meteor/session' 

import './main.html';

Template.chart.onCreated(function helloOnCreated() {
	
});

Template.chart.helpers({
	createChart: function () {
		//setTimeout(function(){
			// Gather data: 
			var allTasks = Tasks.find({type:2}).count()
			incompleteTask = Tasks.find({type:2,completed: false}).count()
			tasksData = [{
							y: incompleteTask,
							name: "ToDo"
						}, {
							y: allTasks - incompleteTask,
							name: "Completed"
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
	'click #btnRec' (event, template) {
		var className = template.$("#inputData").val();
		Meteor.call("copy", className, function(error){
			if (error) {
				console.log(error);
			}
		})
	},
	
	'click #btnStart'(event, template) {
		const target = event.target;
		target.disabled = true;
		var circElms = template.$(".circle");
		for (var i = 0; i < circElms.length; i++) {
			circElms[i].style.display = "none";
			circElms[i].src = 'images/red_circle.png';
		}
		
		var task = (Tasks.find({patient:1, type: parseInt(Session.get("TaskType")), completed: false}).fetch())[0];
		console.log(task.type)
		if (task.type == 2) {
			setTimeout(function(){this.document.getElementById("result").innerHTML = 0;},10); 
			var curState = "palm";
			var ticks = 0;
			Session.set("position","palm");
			var t = setInterval(function(){
				Meteor.call("checkPosition", 2, function(error,res){
					if (error) {
						console.log(error);
					} else {
						console.log(res)
						Session.set("position",res);
					}
				});
				setTimeout(function(){
					if (curState != Session.get("position")) {
						this.document.getElementById("result").innerHTML = ++ticks;
						curState = Session.get("position");
					}
					this.document.getElementById("palm").src = "images/" + Session.get("position") + ".png";
				},10);
			},200);
			 var countDown = task.time;
			 var y = setInterval(function(){
				 this.document.getElementById("counter").innerHTML = countDown;
				countDown--;
				if (countDown < 0) {
					target.disabled = false;
					Meteor.call("updateTasks", function(error){
						if (error) {
							console.log(error);
						}
					})
					clearInterval(t);
					clearInterval(y);
					
				}
			 },1000);
		} else {
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
					Meteor.call("checkPosition", Session.get("TaskType"), function(error,res){
						if (error) {
							console.log(error);
						} else {
							Session.set("result", res);
						}
					})
					setTimeout(function(){
					  this.document.getElementById("result").innerHTML = Session.get("result")
					  },500);
					clearInterval(x);
				  }
			}, 1000);
		}
		
		
		
		
	}
});

Template.todo.events({
	'click .taskChoose' (event, template) {
		const target = event.target;
		console.log(target.value);
		var task = Tasks.find({patient: 1, type: parseInt(target.value)}).fetch();
		console.log(template.$("#descr"));
		template.$("#descr").text(task[0].description);
		Session.set("TaskType", target.value);
		
	}
});