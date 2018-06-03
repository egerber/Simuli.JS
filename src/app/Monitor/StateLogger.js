import Logger from './Logger';
import _ from 'lodash';

export default class StateLogger extends Logger{

	constructor(target,properties,interval){
		super(target);
		this.interval=interval;
		this.properties=properties;

		this.ids=[];
		this.states=[];
		this.timesteps=[];

	}

	log(component){
		this.ids.push(component.id);
		this.states.push(_.pick(component.state,this.properties));
		this.timesteps.push(component.state.timestep);
	}

	get logs(){
		let decompressed=[];

		for(let i=0;i<this.ids.length;i++){
			decompressed.push({id:this.ids[i], state:this.states[i], timestep:this.timesteps[i]});
		}

		return decompressed;
	}

	set logs(logs){

	}


}
