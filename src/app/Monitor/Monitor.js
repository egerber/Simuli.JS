import _ from 'lodash';
import Components from '../Components/ComponentTypes';

export default class Monitor{
	
	constructor(){

		this.state_loggers=[];
		this.event_loggers=[];
		this.activation_loggers=[];
		this.structure_loggers=[];
	}

	add(logger){
	
		if(logger.constructor.name=="ActivationLogger"){
			this.activation_loggers.push(logger);
		}else if(logger.constructor.name=="StateLogger"){
			this.state_loggers.push(logger);
		}else if(logger.constructor.name=="EventLogger"){
			this.event_loggers.push(logger);
		}else if(logger.constructor.name=="StructureLogger"){
			this.structure_loggers.push(logger);
		}

		return this;//allows method chaining
	}

	get data(){
		//collect all logs 
		return {
			states: _.flatten(this.state_loggers.map(logger => logger.logs)),
			events: _.flatten(this.event_loggers.map(logger => logger.logs)),
			activations: _.flatten(this.activation_loggers.map(logger => logger.logs)),
			structure: _.flatten(this.structure_loggers.map(logger=>logger.logs))
		};  
	}

}