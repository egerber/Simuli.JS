import Logger from './Logger';

export default class ActivationLogger extends Logger{

	constructor(targets){
		super(targets);

		this.targets=targets;
		this.ids=[];
		this.activations=[];
		this.timesteps=[];
	}

	log(component){

		if(component._cached_output_exists()){//prevent the logging of un-accessed components in the last time step (lazy loading)
			this.ids.push(component.id);
			this.activations.push(component.output);
			this.timesteps.push(component.state.timestep);
		}
	}

	get logs(){
		let decompressed=[];

		for(let i=0;i<this.ids.length;i++){
			decompressed.push({id:this.ids[i], value:this.activations[i], t:this.timesteps[i]});
		}

		return decompressed;
	}

	set logs(logs){

	}


}