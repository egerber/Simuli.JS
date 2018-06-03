import ComponentFactory from '../Components/ComponentFactory';
import _ from 'lodash';


export default class System{

	/*
	@param env_vars: array of dynamic variables
	@param components: array of components, last component is output component
	*/
	constructor(){
		this.components={}; //last el
		//this.env_vars={};
		//this.feedback_links=[];
		this.output_component=null;//generally refers to the latest added component
	}

	select(component_name){
		return this.components[component_name];
	}

	add_component(component_type, args={},name=undefined){
		let component=ComponentFactory.create(component_type, args);

		if(name==undefined){
			this.components[_.values(this.components).length]=component; //add component in with the index of the next slot
		}else{
			this.components[name]=component;
		}

		this.output_component=component;
		return this;
	}


	tick(){
		//components tick
		let component_arr=_.values(this.components);

		for(let i=0;i<component_arr.length;i++){
			component_arr[i].tick();
		}
		/*
		for(let feedback_link of this.feedback_links){
			feedback_link[1].receive_feedback(feedback_link[0].compute_feedback());
		}*/

		//if lazy computation, otherwise compute all
		let output=this.output_component.output;
	}

	/*takes the unit "name_sender" as input for name_receiver
	for type="Reset", deletes all existing inputs before setting the new one
	for type="Append" appends input to existing inputs
	*/
	connect(name_sender,name_receiver,type="Reset"){
		if(!this.components.hasOwnProperty(name_sender)){
			throw(`the component ${name_sender} was not defined yet`);
		}
		if(!this.components.hasOwnProperty(name_receiver)){
			throw(`the component ${name_receiver} was not defined yet`);
		}

		if(type=="Reset"){
			this.components[name_receiver].inputs=this.components[name_sender];
		}else{
			this.components[name_reciever].add_input(this.components[name_sender]);
		}

		return this;
	}
	set_input_link(name_sender,name_receiver){
		if(!this.components.hasOwnProperty(name_sender) || !this.components.hasOwnProperty(name_receiver)){
			throw("System Object does not contain on of the referred components: (",name_sender,", ",name_recevier,")");
		}

		this.components[name_receiver].inputs=this.components[name_sender];
		return this;
	}

	/*///define a feedback connection between two components (ideal for creating feedback link between a model and some form of performance evaluator)
	set_feedback_link(name_sender,name_receiver){
		if(!this.components.hasOwnProperty(name_sender) || !this.components.hasOwnProperty(name_receiver)){
			throw("System Object does not contain on of the referred components: (",name_sender,", ",name_recevier,")");
		}

		this.feedback_links.push([this.components[name_sender],this.components[name_receiver]]);

		return this;
	}*/

	//defining environment variables for the system
	/*set env_vars(env_vars){
		this._env_vars;
	}

	get variables(){
		return this._env_vars;
	}*/
}