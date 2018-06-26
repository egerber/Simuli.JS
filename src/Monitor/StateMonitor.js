import Monitor from './Monitor';
import _ from 'lodash';

export default class StateMonitor extends Monitor{

	constructor(selected_groups,selected_properties,interval){
		super(selected_groups); 

		
		this.selected_properties=selected_properties;

		this.interval=interval;

		this.logged_props=[];
		for(let i=0;i<selected_properties.length;i++){
			this.logged_props.push([]);
		}

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
			let selected_states=selected_ids.map(id=>components[id].state);

			for(let i=0;i<this.selected_properties.length;i++){
				let prop=this.selected_properties[i]
				this.logged_props[i]=_.concat(this.logged_props[i],selected_states.map(state=>state[prop]));
			}
			
			this.logged_ids=_.concat(this.logged_ids,selected_ids);
			this.logged_timesteps=_.concat(this.logged_timesteps,_.fill(Array(selected_ids.length),timestep));
		}
	}

	get data(){
		let decompressed=new Array(this.logged_ids.length*this.selected_properties.length);

		for(let i=0,length=this.logged_ids.length;i<length;i++){
			for(let j=0,count_props=this.selected_properties.length;j<count_props;j++){
				decompressed[length*j+i]={id:this.logged_ids[i],prop:this.selected_properties[j], value:this.logged_props[j][i],t:this.logged_timesteps[i]}
			}
			
		}

		return decompressed;
	}

	


}
