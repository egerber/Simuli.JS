import DynamicVariable from './DynamicVariable';


/*
Variable for defining feebdack relationships between Variables
needs to be modified, because it is not possible to define feedback loops
*/
export default class FeedbackVariable extends DynamicVariable{

	constructor(initial_value,reference=null,func_value=function(ref_value){return 0}){
		super(initial_value);
		this.reference=reference;
		this.func_value=func_value;
	}

	tick(){
		this._value=this.func_value(this.reference.value);
	}

	get value(){
		return this._value;
	}

	set value(value){
		//should not be called since it breaks the logic
	}

	set reference(reference){
		this.reference=reference; //allows
	}

}
