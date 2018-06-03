import Component from './Component';

import _ from 'lodash';

export default class Synapse extends Component{

	constructor(...args){
		super(...args);
		
		this.state.count_0_0=0;
		this.state.count_0_1=0;
		this.state.count_1_0=0;
		this.state.count_1_1=0;

		this.state.score=0;
		this.state.last_input=undefined;
	}

	compute_output(inputs,state){
		let input=inputs;

		state.last_input=input;

		if(input==0){
			if(state.count_0_0>state.count_0_1){
				return 0;
			}else if(state.count_0_1>state.count_0_0){
				return 1;
			}else{
				return _.random(0,1);
			}
		}else if(input==1){
			if(state.count_1_0>state.count_1_1){
				return 0;
			}else if(state.count_1_1>state.count_1_0){
				return 1;
			}else{
				return _.random(0,1);
			}
		}else{
			console.log("Input for synapse was neither 0 nor 1 ("+input+" given)");
			return _.random(0,1);
		}
	}

	apply_feedback(output,state,feedback){
		//increase score if prediction was correct
		if(output===feedback){
			state.score++;
		}

		let last_input=state.last_input;

		if(last_input===0 && feedback===0){
			state.count_0_0++;
		}else if(last_input===0 && feedback===1){
			state.count_0_1++;
		}else if(last_input===1 && feedback===0){
			state.count_1_0++;
		}else if(last_input===1 && feedback===1){
			state.count_1_1++;
		}
	}

}
