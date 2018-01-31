import Unit from './Unit';

export default class TimeDelayInput extends Unit{

	constructor(input,delay,model){
		super(model);
		this.input=input;
		this.delay=delay;
		this.input_state_history=Array.from({length:delay}, ()=>Math.floor(Math.random()*2));
		this.current_index=0;

		this._state=this.input_state_history[(this.current_index+1) % this.delay];
	}

	update_state(){
		this._state=this.input_state_history[(this.current_index+1) % this.delay]; //set state to the input from "delay" timesteps ago
		this.current_index++; //increment counter
		this.input_state_history[this.current_index]=this.input.state; //set current input state into current time step
	}

	get state(){
		return this._state;
	}


}
