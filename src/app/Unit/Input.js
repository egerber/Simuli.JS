import Unit from './Unit';

export default class Input extends Unit{

	constructor(model){
		super(model);
		this.predictive_unit=null; //only one input port, can be a integrator unit
		this._score=0;
		this._state;
		this.t=0;//timestamp
	}

	get predictive_state(){
		if(this.predictive_unit!=null){
			return this.predictive_unit.predict();
		}else{
			console.log("predictive_unit of input unit is not defined");
		}
	}

	set state(state){ //POSSIBLE: pass t as well in order to not trigger the same event twice
		
		this._state=state;
		
		if(this.predictive_state==state){
			this.increment();
		}

		if(this.predictive_unit!=null){
			this.predictive_unit.feedback(state);
		}
	}

	update(){
		if(this.predictive_unit!=null){
			this.predictive_unit.update();
		}
	}

	reduce(){
		if(this.predictive_unit!=null){
			this.predictive_unit.reduce();
		}
	}

	set_predictive_unit(predictive_unit){
		this.predictive_unit=predictive_unit;
	}

	get state(){
		return this._state;
	}

	reset(){
		super.reset();
		this.predictive_unit.reset();
	}

	

}