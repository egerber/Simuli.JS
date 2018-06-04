import Component from './Component';

export default class Output extends Component{

	constructor(...args){
		super(...args);

		/*if(Array.isArray(this._inputs)){
			throw("Error: Output should reference as input only one component, not an array of components");
		}*/
		this.count_inputs=1; //Every Output component has by definition 1 input
	}

	compute_output(inputs,state){
		return inputs;
	}

	//special
	compute_feedback(output_target,state=this.state,output=this.output){
		return output;
	}

}