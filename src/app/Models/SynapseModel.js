import Model from './Model';
import Synapse from '../Unit/Synapse';
import Integrator from '../Unit/Integrator';
import Input from '../Unit/Input';


export default class SynapseModel extends Model{

	constructor({
		count_inputs=10,
		count_ports=5,
		max_depth=3,
		training_iterations=100 //number of iterations until an update is applied
	}){
		super();
		
		this.training_iterations=training_iterations;
		this.integrator_units=[];
		this.synapses=[];
		this.inputs=[];
		this.t=0;//timestep
		
		for(let i=0;i<count_inputs;i++){
			var input_unit=new Input(this);
			var integrator_unit=new Integrator([], count_ports,max_depth,this);

			input_unit.set_predictive_unit(integrator_unit);

			this.inputs.push(input_unit);
			this.integrator_units.push(integrator_unit);
		}
	}

	get(id){

	}

	get score(){
		
		var score=0;
		for(let input_unit of this.inputs){
			score+=input_unit.score;
		}
		
		if(this.inputs.length>0)
			score/=this.inputs.length;

		return score;
		
	}
	
	//selects and returns random input unit in network
	random_input_unit(){
		return _.sample(this.inputs);
	}

	create_synapse(){
		var synapse=new Synapse(this.random_input_unit(), this); 
		this.synapses.push(synapse);

		return synapse;
	}

	delete_synapse(synapse){

		for(let i=0;i<this.synapses.length;i++){
			if(synapse.id == this.synapses[i].id){
				this.synapses.splice(i,1);
				break;
			}
		}
	}

	create_integrator_unit(arr_predictive_units,count_ports,max_depth){
		var integrator_unit=new Integrator(arr_predictive_units,count_ports,max_depth,this);
		this.integrator_units.push(integrator_unit);

		return integrator_unit;
	}
	
	//applies changes to the model based on statistics from previous runs
	update(){

		for(let input_unit of this.inputs){
			input_unit.update();
		}
	
		for(let input_unit of this.inputs){
			input_unit.reset();
		}

	}

	//returns the input unit with the best score
	get winner(){
		return _.maxBy(this.inputs,"score");
	}

	//returns the input unit with the worst score
	get looser(){
		return _.minBy(this.inputs,"score");
	}

	//sets the state of all input units with the array of inputs
	activate(inputs){
		if(inputs.length!=this.inputs.length){
			throw("Length of inputs and inputs_units must be the same");
		}

		for(let i=0;i<this.inputs.length;i++){
			this.inputs[i].state=inputs[i];
		}

	}

	//runs a certain input through the network and returns the predicted values for the next timestep
	predict(inputs){

		this.activate(inputs);

		var prediction=this.inputs.map( unit => unit.predictive_state);

		//perform changes to the network after a fixed number of training iterations
		if(this.t%this.training_iterations == 0 ){
			this.update();

		}
		
		this.t++;
		
		return prediction;
	}
	
	get elements(){
		
	}

	get connections(){
		
	}
	
	//returns an array of all nodes and edges in the network
	get structure(){
		
	}
	
	//returns an array of the current network activation
	get activation(){
		
	}

}