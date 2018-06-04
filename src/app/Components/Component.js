import Selector from '../Selector/Selector';
import _ from 'lodash'; 
import DynamicVariable from '../DynamicVariables/DynamicVariable';
import ComponentManager from './ComponentManager';

export default class Component{ //prototype of all components in a model

	static default_init_state={"timestep": 1};
	static default_events=[];
	//keeps track of how many components have been initialized
	static countInstances=0;

	constructor({
			count_outputs=1,
			max_inputs=1,
			init_state={},
			events=[], //e.g. [ [(state) => state.score < 10, (model) => model.create_component("Synapse"),100]]
			compute_output=null, //overrides method for computing output value based on state and input of the component
			compute_feedback=null, //overrides method for computing feedback value based on state and current output
			apply_feedback=null, //overrides method for changing component state based on the feedback given
			on_input_deleted=null, //overrides method for reacting on the deletion of one input component
			on_input_changed=null, //overrides method for reacting to a change of one input component
		}={}){

		this.id=Component.countInstances;
		Component.countInstances++;

		this.state={...Component.default_init_state,...init_state};//internal variables of the component
		this.max_inputs=max_inputs;
		this.count_outputs=count_outputs;

		//array of components from which feedforward-signal is received
		this._inputs=[];
		//array of components to which feedback signal is sent
		this._feedback_inputs=[];

		//overrides behavioral methods of components if specified
		if(compute_output!=null){
			this.compute_output=compute_output;
		}
		if(compute_feedback!=null){
			this.compute_feedback=compute_feedback;
		}
		if(apply_feedback!=null){
			this.apply_feedback=apply_feedback;
		}
		if(on_input_deleted!=null){
			this.on_input_deleted=on_input_deleted;
		}
		if(on_input_changed!=null){
			this.on_input_changed=null;
		}

		//checks if the output getter is currently processed in order to prevent circular calls
		this._output_is_evaluated=false;
		
		this._timestep_cache=-1; //timestep of the last cached output
		this._cached_output=null;
		this.events=[...Component.default_events,...events];//determines the behavior of the component given that conditions apply
	
		this.connection_dirtybit=true; //for the StructureLogger: indicates whether a change in the input connection has occured, initially true in order to save first state

	}

	//this method is called for every time step of the parent component
	tick(){

		this._receive_feedback();

		for(let dyn_var of _.values(this.state.__dynamic_properties)){
			dyn_var.tick();
		}

		//check if any conditions apply
		this._handle_events();

		this.state.timestep++;
	}

	//perform state changes based on received feedback
	apply_feedback(feedback=null,state=this.state,output=this.output){
	}

	//is called if the _inputs is deleted
	on_input_deleted(component_id){
		let index=_.findIndex(this._inputs,component_id);
		this._inputs.splice(index,1);
		this.on_input_changed(index,null);
	}

	//is called when one input is changed
	on_input_changed(index,new_component){
	}

	//method for calulating the output value of the current timestep
	//returns the computed value
	compute_output(inputs,state){
		return null;
	}

	//returns the feedback that is passed to the target component 
	compute_feedback(target_output,state=this.state,output=this.output){
		return null;
	}
	

	set_input(component, index=0){
		if(index>this.max_inputs){
			throw("Error: tried to set input for index ",index," but only ", this.max_inputs, " inputs allowed");
		}

		this._inputs[index]=component.id;		

		//notify change of input at given index
		this.on_input_changed(index,component);
		//notify for structure logger that a connection was updated
		this.connection_dirtybit=true; 

	}

	add_feedback_input(component){
		this._feedback_inputs.push(component.id);
	}


	/*
	adds a new input to the input port if a new port exists
	*/
	add_input(input){
		if(this._inputs.length<this.max_inputs){
			this.set_input(input,this._inputs.length);
		}else{
			for(let i=0;i<this._inputs.length;i++){
				if(this._inputs[i]==undefined){
					this.set_input(i,input);
					return;
				}
			}

			//else: no more input slots available, do nothing
		}
	}

	hasInputs(){
		return this._inputs.length>0;
	}

	/*
	@param feedback
	*/
	_receive_feedback(feedback){
		for(let feedback_input of this.feedback_inputs){
			this.apply_feedback(feedback_input.compute_feedback(this.output));
		}
	}

	//marks the begin of the evaluation of the output in order to prevent circular calls
	_begin_output_evaluation(){
		this.output_is_evaluated=true;
	}

	//marks the end of the evaluation of the output in order to prevent circular calls
	_end_output_evaluation(){
		this.output_is_evaluated=false;
	}

	_set_cached_output(value){
		this.timestep_cache=this.state.timestep;
		this.output_cached=value;
	}

	//checks if for the current timestep, a cached result exists (dynamic programming)
	_cached_output_exists(){
		if(this.state.timestep==this.timestep_cache)
			return true;
		else
			return false;
	}

	//iterates over component event and calls handler
	_handle_events(){
		for(let i=0;i<this._events.length;i++){
			if(this.state.timestep % this._events[i].interval==0 && this._events[i].condition(this.state)){
				this._events[i].action(this);
				this.event_trace[i]=true;
			}else{
				this.event_trace[i]=false;
			}
		}
	}

	set feedback_outputs(components=[]){
		this._feedback_outputs=components;
	}

	/*
	technically redundant to set_input
	sets the input references to the component
	*/
	set inputs(inputs=[]){
		
		//notify if previously defined input ports are un-set
		let count_new_inputs;
		let count_old_inputs=this._inputs.length;

		if(Array.isArray(inputs)){
			count_new_inputs=inputs.length;
		}else{
			count_new_inputs=1;
		}

		if(count_old_inputs<count_new_inputs){
			let count_deleted_indices=count_old_inputs-count_new_inputs
			for(let i=0;i<count_deleted_indices;i++){
				this.on_input_changed(count_old_inputs-i-1,null);
			}
		}
		
		if(Array.isArray(inputs)){ //input is array
			for(let i=0;i<inputs.length;i++){
				this.set_input(inputs[i],i);
			}
		}else{ //single input
			this.set_input(inputs,0);
		}
	}

	/*
	returns an array of input references to the component
	*/
	get inputs(){
		return ComponentManager.get_ids(this._inputs);
	}

	get feedback_inputs(){
		return ComponentManager.get_ids(this._feedback_inputs);
	}

	set output(output_value){
		this._set_cached_output(output_value);
	}

	//converts the more readable object notation of an Event-object into a more performant array representation ([func_condition, func_action, interval])
	set events(events){
		this._events=events;

		//event trace saves an array indicating for each event if it was triggered in the last time step. Important for logging events from outside
		this.event_trace=_.times(this._events.length,_.constant(false));
	}
	
	//returns the current input values to the cell
	get input_values(){
		if(this._inputs.length==1){ //for single input, pass over input value "by value" instead of "by array"
			return this.inputs[0].output;
		}else{
			return this.inputs.map(input => input.output);//pass over input values "by array"
		}
	}

	get output(){

		if(this._cached_output_exists()){
			return this.output_cached;
		}

		if(this.output_is_evaluated){ //circular call detected (input1 refers to input2, input2 refers to input1)
			if(this._timestep_cache==this.state.timestep-1){
				return this.output_cached; //return output value from previous timestep
			}else{
				//this may cause problems since the output value from the previous timestep should be returned consistently, yet it is only calculated in a lazy fashion (computation on request)
				return null; //output value from previous timestep not available -> return null
			}
		}

		
		this._begin_output_evaluation();

		let output_value=this.compute_output(this.input_values,this.state);

		//do something

		this._set_cached_output(output_value);

		this._end_output_evaluation();

		return output_value;
	}

	set state(state){

		let new_state={
			__dynamic_properties:{}
		};


		for(let key in state){
			if(state.hasOwnProperty(key)){
				let value=state[key];

				if(value instanceof DynamicVariable){ //state property is dynamic variable
					new_state.__dynamic_properties[key]=value.clone(); //create clone of dynamic variable and add to __dynamic_properties object
					Object.defineProperty(new_state,key,{
						get:function(){
							return this.__dynamic_properties[key].value;
						},
						set:function(new_value){
							this.__dynamic_properties[key].value=new_value;
						}
					})
				}else{ //state property is normal primitive
					new_state[key]=value;
				}
			}
		}

		this._state=new_state;
	}

	get state(){
		return this._state;
	}

	//returns all connections between components in the pool
	get connections(){ 
		this.connection_dirtybit=false;
		
		if(this._inputs==null){
			return {src: null,target:this.id};
		}else{
			return {src: this._inputs.id, target:this.id}; //WARNING: will throw error for
		}

	}

}
