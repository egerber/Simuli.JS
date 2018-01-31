export default class Model{

	constructor(){

	}

	get(id){
		return this.input_units.filter(function(unit){
			return unit.id==id;
		});
	}
port
	
	performance(){

	}
	
    get score(){
    	
    }

	//applies changes to the model based on statistics from previous runs
	update(){

	}
	
	//runs a certain input through the network and returns the predicted values for the next timestep
	predict(inputs){

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