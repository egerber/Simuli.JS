import PatternGenerator from './PatternGenerator';
import {has} from 'lodash';

export default class PeriodicPattern extends PatternGenerator{

	//generates random periodic pattern of specified period
	constructor({
		period=3,
		length_row=5
	}){
		super();
		
		this.current_index=0;
		this.period=period;
		this.length_row=length_row;
		this.pattern=[];
		for(var i=0;i<period;i++){
			this.pattern.push(Array.from({length: length_row}, () => Math.floor(Math.random() * 2)));
		}
	}

	next_row(){
		this.current_index=(this.current_index+1) % this.period;
		return this.pattern[this.current_index];
	}

	
}
