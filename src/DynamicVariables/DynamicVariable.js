export default class DynamicVariable{

	constructor(init_value, other_params){
		this._value=init_value;
		this.timestep=0; //keeps track of time
	}

	tick(){

	}

	//must be overriden by each sub class 
	get value(){
			return this._value;
	}
	
	//overriden by each sub class
	set value(new_value){

	}

	//returns copy of object instance, including methods
	clone(){
		return Object.assign(Object.create(Object.getPrototypeOf(this)),this);
	}
}