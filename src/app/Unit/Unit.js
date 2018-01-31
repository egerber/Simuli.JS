
export default class Unit{ //prototype of all units in a model

	
	//uses the template design pattern and extends or modifies the existing prototype by specified methods
	static create_prototype(methods){
	}

	constructor(model){
		if(model==null){
			throw("Error: Model must be specified, not null");
		}
		this.model=model;
		
		this._score=0;

		this.id=Unit.countInstances;
		Unit.countInstances++;
	}

	increment(){
		this._score++;
	}

	decrement(){
		this._score--;
	}

	get score(){
		return this._score;
	}

	reset(){
		this._score=0;
	}


}

Unit.countInstances=0;
