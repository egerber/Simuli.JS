import DynamicVariable from './DynamicVariable';
import _ from 'lodash';

export default class RandomUniform extends DynamicVariable{

	//if min or max are given as floating numbers, the generated random numbers are floating numbers as well, otherwise integers	
	/*
	@param min
	@param max
	@param floating: random variable is floating number (false => random variable is integer withing inclusive min and max bounds)
	*/
	constructor(init_value=_.random(0,1),min=0,max=1,floating=false){
		super(init_value);
		this.min=min;
		this.max=max;
		this.floating=floating
	}	

	tick(){
		this._value=_.random(this.min,this.max,this.floating);
		this.timestep++;
	}


}