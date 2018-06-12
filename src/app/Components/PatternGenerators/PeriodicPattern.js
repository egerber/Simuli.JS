import Component from '../Component';
import _ from 'lodash';

export default class PeriodicPattern extends Component{

	constructor({period=5,initial_state={last_input:undefined}}={}){
		super(...arguments);

		if(initial_state.last_input===undefined){
			this.state.last_input=Array.from({length:this.slots_input},() => _.random(0,1));
		}

		this.state["period"]=period;
		this.state["pattern"]=[];

		for(var i=0;i<this.state.period;i++){
			this.state.pattern.push(Array.from({length: this.slots_input}, () => _.random(0,1)));
		}
	}
	
	//returns as feedback the output of the next time step
	compute_feedback(input,output=this.output,state=this.state){
		return this.compute_output(null,{...state,timestep:state.timestep+1});
	}

	compute_output(inputs,state){
		return state.pattern[state.timestep%state.period];
	}

}