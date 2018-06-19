import Monitor from './Monitor';
import _ from 'lodash';

export default class ActivationMonitor extends Monitor{

	constructor(selection,type,interval){
		super(selection);
		
		this.type=type;
		this.interval=interval;
	
		this.logged_activations=[];
		this.logged_ids=[];
		this.logged_timesteps=[];
	}

	log(components,groups,timestep){
		if(timestep%this.interval==0){
			let selected_ids=_.flatten(this.selected_groups.map( group_name=>groups[group_name]));
			let selected_activations;
			
			if(this.type=="feedforward"){
				selected_activations=selected_ids.map(id=>components[id].current_output);
			}else{
				selected_activations=selected_ids.map(id=>components[id].current_feedback);
			}

			this.logged_ids=_.concat(this.logged_ids,selected_ids);
			this.logged_activations=_.concat(this.logged_activations,selected_activations);
			this.logged_timesteps=_.concat(this.logged_timesteps,_.fill(Array(selected_ids.length),timestep));
		}
	}

	get data(){

		let decompressed=[];

		for(let i=0,length=this.logged_ids.length;i<length;i++){
			decompressed.push({id:this.logged_ids[i], value:this.logged_activations[i], t:this.logged_timesteps[i]});
		}

		return decompressed;
	}





}