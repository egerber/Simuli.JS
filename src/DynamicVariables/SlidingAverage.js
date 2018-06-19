import DynamicVariable from './DynamicVariable';
import _ from 'lodash';

export default class SlidingAverage extends DynamicVariable{

	/*
	@param interval: number of timesteps over which the values are averaged out
	*/
	constructor(init_value=_.random(0,1),interval=25){
		super(init_value);

		this.interval=interval;
		this.arr_values=new Array(interval);
		this.arr_values[0]=init_value;
	}

	tick(){
		this.timestep++;
	}
	
	get value(){
		return this._value;
	}

	set value(value){
		this.arr_values[this.timestep%this.interval]=value;
		
		if(this.timestep>=this.interval){
			this._value=_.mean(this.arr_values);
		}else{//average only over existing entries (<interval)
			let sum=0.0;
			
			for(let i=0;i<=this.timestep;i++){
				sum+=this.arr_values[i];
			}

			this._value=sum/(this.timestep+1);
		}

	}

}

