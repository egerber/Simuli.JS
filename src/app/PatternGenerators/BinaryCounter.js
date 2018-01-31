import PatternGenerator from './PatternGenerator';
import {has} from 'lodash';

export default class BinaryPattern extends PatternGenerator{

	//generates random periodic pattern of specified period
	constructor({
		length_row=5,
		increment=null,//increment per timestep, if null, random number is generated
		start_value=null
	}){
		super();
		
		this.current_index=0;

		if(increment===null)
			this.increment=Math.floor(Math.random()*length_row);
		else
			this.increment=increment;

		if(start_value===null)
			this.current_value=Array.from({length:length_row}, () => Math.floor(Math.random()*2));
		else
			this.current_value=start_value;
		
	}

	next_row(){
		
	}

}
