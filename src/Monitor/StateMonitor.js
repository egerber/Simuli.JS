import Monitor from './Monitor';
import _ from 'lodash';

export default class StateMonitor extends Monitor{

	constructor(selected_groups,selected_state_properties,interval){
		super(selected_groups); 

		
		this.selected_state_properties=selected_state_properties;

		this.interval=interval;

		this.logged_states=[];
		this.logged_ids=[];
		this.logged_timesteps=[];
	}

	_pick_properties(obj,properties){
		let selection=new Array(properties.length);
		for(let i=0;i<properties.length;i++){
			selection[i]=obj[properties[i]]
		}

		return selection;
	}

	log(components,groups,timestep){

		if( (timestep % this.interval)==0){
			let selected_ids=_.flatten(this.selected_groups.map( group_name=>groups[group_name]));
			
			let selected_states=selected_ids.map( id => this._pick_properties(components[id].state,this.selected_state_properties));

			this.logged_ids=_.concat(this.logged_ids,selected_ids);
			this.logged_states=_.concat(this.logged_states,selected_states);
			this.logged_timesteps=_.concat(this.logged_timesteps,_.fill(Array(selected_ids.length),timestep));
		}
	}

	get data(){
		let decompressed=new Array(this.logged_ids.length);

		for(let i=0,length=this.logged_ids.length;i<length;i++){
			decompressed[i]={id:this.logged_ids[i],state:this.logged_states[i],t:this.logged_timesteps[i]}
		}

		return decompressed;
	}

	


}
