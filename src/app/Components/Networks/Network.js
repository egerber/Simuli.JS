import _ from 'lodash';

import Component from '../Component';
import ComponentFactory from '../ComponentFactory';
import Input from '../Input';
import Output from '../Output';
import Selector from '../../Selector/Selector';

export default class Network extends Component{

	constructor({
			components={}, //e.g. {"Synapse": {max_count_inputs}}
			connections=[],
			init=function(){}
		}={},session=session)
		{
		super(...arguments);

		this.state.score=0;
		
		this.components=components;

		//Object of Lists of member components, structured by group
		this.groups={
			"Input":Array.from({length:this.slots_input},()=>new Input()), //Initial group is input and output components
			"Output":Array.from({length:this.count_outputs},()=>new Output())
		};

		this.state.groups=this.groups; //ONLY TEMPORARY SOLUTIONS in order to given event condition access to members

		init(this);

		for(let connection of connections){ //connections must be established last, otherwise init was not called and no components exist
			this.establish_connection(connection);
		}
	}

	transform_input(inputs){
		return inputs;
	}

	apply_feedback(output,state,feedback){
		
		//calculate score of previous prediction	
		for(let i=0;i<feedback.length;i++){
			if(output[i]===feedback[i]){
				state.score+=1.0/feedback.length;
			}
		}	
	}

	compute_feedback(output,state,feedback){
		return feedback; //pass on given feedback to output Components
	}

	_send_feedback(feedback=null){

		if(feedback==null){
			return;
		}

		if(feedback.length!=this.groups["Output"].length){
			throw("Error: Length of feedback and length of output from model do not match");
		}

		this.groups["Output"].forEach( (output,index) => output._receive_feedback(feedback[index]));
	}

	//API method for receiving components from the model (applying filter + special selection method)
	//TODO Selector should not be created for each called, instead store in component
	//quantity -1 returns all elements with the applied filter
	select(group_name,quantity=-1,filter_func=()=>true,selector=Selector.Random()){
		if(!this.groups.hasOwnProperty(group_name)){
			return [];
		}else{
			//resolve indices
			let group_items=this.groups[group_name];
			let filtered=group_items.filter(filter_func);
			if(quantity==-1){
				return filtered;
			}else{
				return selector(filtered,quantity);
			}
		}
	}

	create(component_type,quantity=1,groups=[],component_args={}){

		if(groups.length==0){ //by default, every new element with unspecified group is placed in the group of its specific type
			groups=[component_type];
		}

		for(let group of groups){
			if(!this.groups.hasOwnProperty(group)){
				this.groups[group]=[];
			}
		}

		let new_components=Array.from({length:quantity},(x)=>ComponentFactory.create(component_type,component_args));
	
		//Push created components to groups
		for(let group of groups){
			for(let component of new_components){
				this.groups[group].push(component);
			}
		}

		return new_components;
	}

	delete(component_delete){

		//delete the reference from the group
		for(let group_name of _.keys(this.groups)){
			let index=_.findIndex(this.groups[group_name],component_delete);
			if(index!=-1){
				this.groups[group_name].splice(index,1); //delete reference
			}
		}

		//delete the session instance + resolve all links to it
		session.delete(component_delete);

	}

	//connects components of two pools with each other
	establish_connection(connection){
		//src is selector
		//target is selector
		//mapper is selector

		//selector should be combination of filter && picker
		
		let src_components;
		let target_components;
		if(typeof connection.src == "string"){
			if(!this.groups.hasOwnProperty(connection.src)){
				throw(`False src: group ${connection.src} does not exist`);
			}
			src_components=this.groups[connection.src];
		}else if(Array.isArray(connection.src)){
			src_components=connection.src;
		}else{
			throw("Invalid type given for Connection src", connection.src);
		}

		if(typeof connection.target == "string"){
			if(!this.groups.hasOwnProperty(connection.target)){
				throw(`False target: group ${connection.target} does not exist`);
			}
			target_components=this.groups[connection.target];
		}else if(Array.isArray(connection.target)){
			target_components=connection.target;
		}else{
			throw("Invalid type given for Connection target");
		}

		let pairs=connection.mapper(src_components,target_components);

		//reset all existing feedforward and feedback connections
		if(connection.reset){
			for(let target of target_components){
				target.input_links=[];
			}
			for(let source of src_components){
				source.feedforward_outputs=[];
			}
		}

		if(connection.type=="feedforward"){
			for(let pair of pairs){
				pair[1].add_input_link(pair[0]);
			}
		}else if(connection.type=="feedback"){
			for(let pair of pairs){
				pair[0].add_feedback_link(pair[1]);
			}
		}else if(connection.type="bidirectional"){
			for(let pair of pairs){
				pair[1].add_input_link(pair[0]);
				pair[0].add_feedback_link(pair[1]);
			}
		}else{
			throw(`The connection type ${connection.type} does not exist`);
		}


	}

	compute_output(inputs,state){
		//set output value for input components (MAYBE this should be done in the tick method)
		this.groups["Input"].forEach( (input,i) => input.output=inputs[i]);

		return this.groups["Output"].map( (output) => output.output);
	}

	//call tick method on all children
	tick(){
		super.tick();

		//call tick on ressource
		/*for(let pool of _.values(this.pools)){
			pool.tick();
		}*/

		//call tick on all members
		for(let component_type in this.groups){
			for(let component of this.groups[component_type]){
				component.tick();
			}
		}


	}


}