import {Mongo} from 'meteor/mongo';

export const Tasks = new Mongo.Collection('tasks');
export const Train = new Mongo.Collection('train');
export const ChartData = new Mongo.Collection('chartData');
