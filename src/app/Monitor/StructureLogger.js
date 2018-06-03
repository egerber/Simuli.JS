import Logger from './Logger';


export default class StructureLogger extends Logger{

	constructor(){
		super();
		this.timesteps=[];
		this.connections=[];
		this.elements=[];
	}

	log(component){

		//save only the changes that occured at each time step, reconstruct full network structure at each timestep later
		if(component.connection_dirtybit){
			this.timesteps.push(component.state.timestep);
			this.connections.push(component.connections);
			this.elements.push({}) //TODO
		}else{
			//do nothing, no change occured from the last timestep
		}
	}

	get logs(){

		let decompressed=new Array(this.timesteps.length);

		for(let i=0;i<this.timesteps.length;i++){
			decompressed[i]={t:this.timesteps[i],src:this.connections[i].src, target:this.connections[i].target}
		}
		//decompress structure data of change logs

		return decompressed;
	}

	set logs(logs){
	}



}