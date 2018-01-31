import SynapseModel from './SynapseModel';
import Synapse from '../Unit/Synapse';
import Integrator from '../Unit/Integrator';
import Input from '../Unit/Input';
import TimeDelayInput from '../Unit/TimeDelayInput';

export default class MultiTimestepModel extends SynapseModel{

	constructor({
		count_inputs=10,
		count_ports=5,
		max_depth=3,
		max_delay=5,
		training_iterations=100 //number of iterations until an update is applied
	}){
		super({count_inputs,count_ports,max_depth,training_iterations});

		this.max_delay=max_delay;
		this.time_delay_units=[];

		//for each input, create delay units for time steps 0,...,max_delay
		for(let i=0;i<this.inputs.length;i++){
			for(let t=0;t<=max_delay;t++){
				this.time_delay_units.push(new TimeDelayInput(this.inputs[i], t,this));
			}
		}
	}

	//selects and returns random input unit in network
	random_input_unit(){
		return _.sample(this.time_delay_units);
	}

	activate(inputs){
		super.activate(inputs);

		for(let time_delay_unit of this.time_delay_units){
			time_delay_unit.update_state();
		}
	}

}