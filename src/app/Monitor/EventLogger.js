import Logger from './Logger';

export default class EventLogger extends Logger{

	constructor(target,events=[]){
		super(target);
		this.events=events;


		this.event_names=undefined; //define on the fly
		this.ids=[];
		this.events=[];
		this.timesteps=[];
	}

	log(component){
		if(this.event_names===undefined){
			this.event_names=component._events.map( event => event.name);
		}
	
		this.ids.push(component.id);
		this.events.push(component.event_trace);
		this.timesteps.push(component.state.timestep);
		
	}

	//TODO, split up each individual event into new entry by name e.g {id:12, event:"Reconnect", t:5}
	get logs(){
		let decompressed=[];
		for(let i=0;i<this.ids.length;i++){
			for(let j=0;j<this.events[i].length;j++){
				if(this.events[i][j]){
					decompressed.push({id: this.ids[i], event:this.event_names[j], t:this.timesteps[i]});
				}
			}
		}

		return decompressed;
	}

	set logs(logs){

	}

}