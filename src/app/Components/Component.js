import Selector from '../Selector/Selector';
import _ from 'lodash'; 
import DynamicVariable from '../DynamicVariables/DynamicVariable';

export default class Component{ //prototype of all components in a model

	static default_init_state={"timestep": 1};
	static default_events=[];
	//keeps track of how many components have been initialized
	static countInstances=0;

	constructor({
			count_outputs=1,
			slots_input=1,
			slots_feedback=1,
			init_state={},
			events=[], //e.g. [ [(state) => state.score < 10, (model) => model.create_component("Synapse"),100]]
			compute_output=null, //overrides method for computing output value based on state and input of the component
			compute_feedback=null, //overrides method for computing feedback value based on state and current output
			apply_feedback=null, //overrides method for changing component state based on the feedback given
			on_input_deleted=null, //overrides method for reacting on the deletion of one input component
			on_input_link_changed=null, //overrides method for reacting to a change of one input component
			on_feedback_link_changed=null,
		}={},session){

		this.id=Component.countInstances;
		Component.countInstances++;
		this._session=session; //hold reference to current session in order to notify changes of connections etc.

		this.state={...Component.default_init_state,...init_state};//internal variables of the component
		this.slots_input=slots_input;
		this.count_outputs=count_outputs;

		//array of components from which feedforward-signal is received
		this._input_links=[];
		//array of components from which feedback signal is received
		this._feedback_links=[];

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
		if(on_input_link_changed!=null){
			this.on_input_link_changed=on_input_link_changed;
		}
		if(on_feedback_link_changed!=null){
			this.on_feedback_link_changed=on_feedback_link_changed;
		}

		//checks if the output getter is currently processed in order to prevent circular calls
		this._output_is_evaluated=false;
			
		this._timestep_cache=-1; //timestep of the last cached output
		this._cached_output=null;
		this.events=[...Component.default_events,...events];//determines the behavior of the component given that conditions apply

		this._delayed_output=null;
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
		this._delayed_output=this.compute_output(this.delayed_input_values,this.state);


	}

	//perform state changes based on received feedback
	apply_feedback(feedback=null,state=this.state,output=this.output){
	}

	//is called if the _inputs is deleted
	on_input_link_deleted(component){
		let index=this._input_links.map(link=>link.id).indexOf(component.id);
		this._input_links.splice(index,1);
		this.on_input_link_changed(index,null);
	}

	on_feedback_link_deleted(component){
		let index=this._feedback_links.map(link=>link.id).indexOf(component.id);
		this._feedback_links.splice(index,1);
		this.on_feedback_link_changed(index,null);
	}

	//is called when one feedback is changed
	on_input_link_changed(index,new_component){
	}

	on_feedback_link_changed(index,new_component){
	}

	//method for calulating the output value of the current timestep
	//returns the computed value
	compute_output(inputs,state){
		return null;
	}

	//returns the feedback that is passed to the target component 
	compute_feedback(output=this.output,state=this.state){
		return null;
	}
	

	set_input_link(component, index=0){
		if(index>this.slots_input){
			throw(`Error: tried to set input_link for index ${index} but only ${this.slots_input} input links allowed`);
		}

		this._input_links[index]=component;		
		this.on_input_link_changed(index,component);//notify change of input at given index

		if(this.session!=null){
			session.add_connection(component.id,this.id,"feedforward");
		}
	}

	set_feedback_link(component,index=0){
		if(index>this.slots_feedback){
			throw(`Error: tried to set feedback_link for index ${index} but only ${this.slots_input} feedback links allowed`);
		}

		this._feedback_links[index]=component;
		this.on_feedback_link_changed(index,component);

		if(this.session!=null){
			session.add_connection(component.id,this.id,"feedback");
		}
	}

	add_feedback_link(component){
		if(this._feedback_links.length<this.slots_feedback){
			this.set_feedback_link(input_link,this._feedback_links.length);
		}else{
			for(let i=0;i<this._feedback_links.length;i++){
				if(this._feedback_links[i]==undefined){
					this.set_feedback_link(i,input_link);
					return;
				}
			}
			//else: no more feedback_slots available, do nothing
		}
	}


	/*
	adds a new input to the input port if a new port exists
	*/
	add_input_link(input_link){
		if(this._input_links.length<this.slots_input	){
			this.set_input_link(input_link,this._input_links.length);
		}else{
			for(let i=0;i<this._input_links.length;i++){
				if(this._input_links[i]==undefined){
					this.set_input_link(i,input_link);
					return;
				}
			}

			//else: no more input_link slots available, do nothing
		}
	}

	/*
	@param feedback
	*/
	_receive_feedback(){
		for(let feedback_link of this.feedback_links){
			this.apply_feedback(feedback_link.compute_feedback(this.output),this.state,this.output);
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

	set feedback_links(inputs=[]){
		//notify if previously defined input ports are un-set
		let count_new_inputs;
		let count_old_inputs=this._feedback_links.length;
		this._feedback_links=[];
		if(Array.isArray(inputs)){
			count_new_inputs=inputs.length;
		}else{
			count_new_inputs=1;
		}

		if(count_old_inputs<count_new_inputs){
			let count_deleted_indices=count_old_inputs-count_new_inputs
			for(let i=0;i<count_deleted_indices;i++){
				let index=count_old_inputs-i-1
				this.on_feedback_link_changed(index,null);
			}
		}
		
		if(Array.isArray(inputs)){ //input is array
			for(let i=0;i<inputs.length;i++){
				this.set_feedback_link(inputs[i],i);
			}
		}else{ //single input
			this.set_feedback_link(inputs,0);
		}
	}

	/*
	technically redundant to set_input
	sets the input references to the component
	*/
	set input_links(input_links=[]){
		//notify if previously defined input ports are un-set
		let count_new_inputs;
		let count_old_inputs=this._input_links.length;
		this._input_links=[];
		if(Array.isArray(input_links)){
			count_new_inputs=input_links.length;
		}else{
			count_new_inputs=1;
		}

		if(count_old_inputs<count_new_inputs){
			let count_deleted_indices=count_old_inputs-count_new_inputs
			for(let i=0;i<count_deleted_indices;i++){
				let index=count_old_inputs-i-1
				this.on_input_link_changed(index,null);
			}
		}
		
		if(Array.isArray(input_links)){ //input is array
			for(let i=0;i<input_links.length;i++){
				this.set_input_link(input_links[i],i);
			}
		}else{ //single input
			this.set_input_link(input_links,0);
		}
	}

	/*
	returns an array of input references to the component
	*/
	get input_links(){
		return this._input_links;
	}

	get feedback_links(){
		return this._feedback_links;
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
		if(this.input_links.length==1){ //for single input, pass over input_link value "by value" instead of "by array"
			return this.input_links[0].output;
		}else{
			return this.input_links.map(link => link.output);//pass over input values "by array"
		}
	}

	get delayed_input_values(){
		if(this.input_links.length==1){
			return this.input_links[0].delayed_output;
		}else{
			return this._input_links.map(link => link.delayed_output);
		}
	}

	get feedback_values(){
		if(this.feedback_links.length==1){
			return this.feedback_links[0].feedback;
		}else{
			return this.feedback_links.map(link => link.feedback);
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

	get delayed_output(){
		return this._delayed_output;
	}


	get feedback(){
		if(this._cached_feedback_exists()){
			return this.feedback_cached;
		}else{
			let feedback_value=this.compute_feedback(this.output,this.state);
			i
		}
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

}
