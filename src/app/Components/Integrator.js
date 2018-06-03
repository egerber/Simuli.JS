import Component from './Component';
import Synapse from './Synapse';
import _ from 'lodash';

export default class Integrator extends Component{


	constructor(...args){
		super(...args);
	}

	compute_output(inputs,state){
		let arr_count=[0,0];

		for(let value of inputs){
			arr_count[value]++;
		}

		if(arr_count[0]>arr_count[1]){
			return 0;
		}else if(arr_count[1]>arr_count[0]){
			return 1;
		}else{
			return _.random(0,1);
		}
	}

	compute_feedback(input,output,state,feedback){
		return feedback;
	}

	apply_feedback(output,state,feedback){
		if(output==feedback){
			state.score++;
		}
	}

	

}