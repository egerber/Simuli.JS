import DynamicVariable from './DynamicVariable';
import _ from 'lodash';

export default class Custom extends DynamicVariable{	

	/*
	@param func(value,t), given current value and timestep, calculates the current value
	*/
	constructor(init_value=_.random(0,1),func=function(value,t){return 0}){
		super(init_value);
		this.func=func;
	}

	get value(){
		return this._value;
	}

	set value(value){
		this._value=value;
	}

	tick(){
		this.timestep++;
		this._value=this.func(this._value,this.timestep);
	}

}