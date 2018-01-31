import PredictiveUnit from './PredictiveUnit';
import Synapse from './Synapse';
import {has} from 'lodash';
import components from './IntegratorComponents';

export default class Integrator extends PredictiveUnit{

	static create_prototype(methods){
		for(let method_type in methods){

			var method=components.get(methods[method_type]);
			if(method===undefined){
				throw(`Error: Method ${method_name} was not found`);
			}

			Integrator.prototype[method_type]=method;
		}
	}


	constructor(arr_predictive_units,count_ports,max_depth,model){
		super(model);

		this.count_ports=count_ports;//how many predictive_units/integrator_units can give input
		this.max_depth=max_depth; //how many more branches can be created from this level
		this.predictive_units=arr_predictive_units;
		this.predictive_state;
		this.initial_state=true; //indicates whether still branches are build or reductive measures can be taken
	}

	get state(){
		return this.virtual_link.state;
	}

	predict(){

		var predictions=[0,0]; // {0=>0, 1=>0}
		var predictive_state=_.random(0,1);

		for(let i=0;i<this.predictive_units.length;i++){
			let prediction=this.predictive_units[i].predict();
			predictions[prediction]++;
		}

		if(predictions[0]>predictions[1]){
			predictive_state=0;
		}else if(predictions[1]>predictions[0]){
			predictive_state=1;
		}

		this.predictive_state=predictive_state;
		return predictive_state;
	}

	update(){

		//add new units
		if(this.predictive_units.length<this.count_ports){
			this.predictive_units.push(this.model.create_synapse());
		}else{
			this.initial_state=false; //branch is full 

			var looser_unit=this.looser;

			if(this.max_depth==0){//replace looser predictive_units
				looser_unit.update();
			}else{//put looser predictive_units into new integrator unit 
				if(looser_unit instanceof Synapse){
					var integrator_unit=this.model.create_integrator_unit([looser_unit],this.count_ports,this.max_depth-1);
					
					this.replace_items(looser_unit,integrator_unit);
					integrator_unit.update(); //trigger adding a new synapse
				}else if(looser_unit instanceof Integrator){
					looser_unit.update();
				}
			}
		}

	}

	reduce(){

		//reduce amount of units
		if(!this.initial_state){
			//console.log("reducing");
			//check if this branch contains other branches (other integrative units are children)
			var contains_branches=false;
			for(let predictive_unit of this.predictive_units){
				if(predictive_unit instanceof Integrator){
					contains_branches=true;
					break;
				}
			}

			if(contains_branches){ //trigger reduction of winning integrator_units
				 //select predictive unit with lowest score
				var winner_unit=this.winner;

				if(winner_unit instanceof Integrator){ //necessary check?
					winner_unit.reduce();
				}else{
					//do nothing, no reduction possible
				}

			}else{ //remove loosing synapse
			
				var looser_unit=this.looser;
				if(looser_unit===undefined || looser_unit===null){
					console.log("ERROR",this);
				}
				this.delete_item(looser_unit);
				this.model.delete_synapse(looser_unit);
			}
		}
		else{
			//console.log("still_initialising");
		}

	}

	delete_item(predictive_unit){
		this.predictive_units.splice(this.predictive_units.indexOf(predictive_unit),1);
	}
	//replace one predictive element with another
	replace_items(old_item, new_item){
		var index=this.predictive_units.indexOf(old_item);
		this.predictive_units[index]=new_item;
	}

	feedback(output){
		if(this.predictive_state==output){
			this.increment();
		}

		for(let i=0;i<this.predictive_units.length;i++){
			this.predictive_units[i].feedback(output);
		}
	}

	//child with highest score
	get winner(){
		return _.maxBy(this.predictive_units,"score");
	}

	//child with lowest score
	get looser(){
		return _.minBy(this.predictive_units,"score");
	}

	reset(){

		super.reset();
		this.predictive_state=_.random(0,1);

		for(let i=0;i<this.predictive_units.length;i++){
			this.predictive_units[i].reset();
		}
	}
}