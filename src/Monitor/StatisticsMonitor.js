import Monitor from './Monitor';
import _ from 'lodash';
/*
Helper functions 
*/

function std(values){
  var mean = avg(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - mean;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = avg(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function avg(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var mean = sum / data.length;
  return mean;
}

export default class StatisticsMonitor extends Monitor{

	constructor(selection, state_properties,interval){
		super(selection);
		this.interval=interval;
		this.state_properties=state_properties;

		this.logged_aggregations=[];
		this.logged_timesteps=[];
		this.logged_properties=[];
	}


	log(components,groups,timestep){
		if(timestep % this.interval==0){
			let selected_ids=_.flatten(this.selected_groups.map( group_name=>groups[group_name]));
			let selected_states=selected_ids.map( id => components[id].state);

			for(let state_property of this.state_properties){
				
				let selected_properties=selected_states.map(state=>state[state_property]);
				let min=Math.min(...selected_properties);
				let max=Math.max(...selected_properties);
				let mean=avg(selected_properties);
				let std_dev=std(selected_properties);

				this.logged_aggregations.push([min,max,mean,std_dev]);
				this.logged_timesteps.push(timestep);
				this.logged_properties.push(state_property);
			}
		}
	}

	get data(){
		let length=this.logged_timesteps.length;

		let data=new Array(length);
		
		for(let i=0;i<length;i++){
			data[i]={
				group:this.selected_groups.toString(), //name of selected group
				prop:this.logged_properties[i], 
				min:this.logged_aggregations[i][0], 
				max:this.logged_aggregations[i][1],
				mean:this.logged_aggregations[i][2],
				std:this.logged_aggregations[i][3],
				t:this.logged_timesteps[i]
			};
		}

		return data;
	}


}


