import PredictiveUnit from './PredictiveUnit';
import {has} from 'lodash';

export default class Synapse extends PredictiveUnit{

	constructor(input,model){
		super(model);
		this.input=input;
		
		this.last_input_state;
		this.predictive_state;
		this.reset();
	}

	update(){
		//somehow select new node
		//e.g. model.require_node();
		this.input=this.model.random_input_unit(); //TODO implement model.random_node() and make model globally accessible
		//OR create static variable for all classes called model
		this.reset();
	}

	predict(){

		var input_state=this.input.state;
		var predictive_state=_.random(0,1);

		if(input_state==0){
			if(this.count_0_0>this.count_0_1){//TODO 
				predictive_state=0;
			}else if(this.count_0_1>this.count_0_0){
				predictive_state=1;
			}
		}else if(input_state==1){
			if(this.count_1_0>this.count_1_1){
				predictive_state=0;
			}else if(this.count_1_1>this.count_1_0){
				predictive_state=1;
			}
		}

		this.last_input_state=input_state;
		this.predictive_state=predictive_state;

		return predictive_state;
	}

	feedback(output){		
		//increase score if prediction was correct
		if(this.predictive_state==output){
			this.increment();
		}

		if(this.last_input_state==0 && output==0){
			this.count_0_0++;
		}else if(this.last_input_state==0 && output==1){
			this.count_0_1++;
		}else if(this.last_input_state==1 && output==0){
			this.count_1_0++;
		}else if(this.last_input_state==1 && output==1){
			this.count_1_1++;
		}

	}

	reset(){
		super.reset();

		this.count_0_0=0;
		this.count_0_1=0;
		this.count_1_0=0;
		this.count_1_1=0;

		this.predictive_state=_.random(0,1);
		this.last_input_state=_.random(0,1); //check if this should be randomized
	}
}
