import _ from 'lodash';

export default class Executer{

	constructor(){
		this.timestep=0;
	}

	next(components,computational_graph){
		let ids=computational_graph.get_order("feedforward");
		this._tick(components,ids);
		this._handle_events(components,ids);
		this._propagate_feedforward(components,computational_graph)
		this._propagate_feedback(components,computational_graph);

		this.timestep++;
	}

	_tick(components, ids){

		for(let id of ids){
			let component=components[id];
			component.state.timestep=this.timestep;
			
			component.last_output=component.current_output;
			component.current_output=undefined;
			component.last_feedback=component.current_feedback;
			component.current_feedback=undefined;

			for(let dyn_var of _.values(component.__dynamic_properties)){
				dyn_var.tick();
			}

		}
	}

	_propagate_feedforward(components,computational_graph){
		let ids_ordered=computational_graph.get_order("feedforward");

		for(let id of ids_ordered){
			let component=components[id];

			if(!component.schema.hasOwnProperty("compute_output")){
				component.current_output=undefined;
				continue;
			}

			let feedforward_inputs=computational_graph.get_in_connections(id,"feedforward");

			let inputs=new Array(feedforward_inputs.length);
			for(let i=0;i<inputs.length;i++){
				if(feedforward_inputs[i][2]==0){ //if delay==0
					inputs[i]=components[feedforward_inputs[i][0]].current_output;
				}else{
					inputs[i]=components[feedforward_inputs[i][0]].last_output;
				}
			}
			component.current_output=component.schema.compute_output(inputs,component.state);
		}
	}

	_propagate_feedback(components,computational_graph){
		let ids_ordered=computational_graph.get_order("feedback");

		for(let id of ids_ordered){
			let component=components[id];

			//fetch and apply all feedback inputs
			if(component.schema.hasOwnProperty("apply_feedback")){
				let feedback_inputs=computational_graph.get_in_connections(id,"feedback");
				let inputs=new Array(feedback_inputs.length);
				for(let i=0;i<inputs.length;i++){
					if(feedback_inputs[i][2]==0){ //if delay==0
						//apply_feedback(current_output,state,current_feedback_value)
						component.schema.apply_feedback(component.current_output,component.state,components[feedback_inputs[i][0]].current_feedback);
					}else{
						//apply_feedback(current_output,state,current_feedback_value)
						component.schema.apply_feedback(component.last_output,component.state,components[feedback_inputs[i][0]].last_feedback);
					}
				}				
			}

			//compute feedback for component
			if(component.schema.hasOwnProperty("compute_feedback")){
				component.current_feedback=component.schema.compute_feedback(component.current_output,component.state);
			}

		}
	}

	_handle_events(components,ids){
		
		for(let id of ids){
			let component=components[id];
			if(!component.schema.hasOwnProperty("events")){
				continue;
			}

			let count_events=component.schema.events.length;

			for(let i=0;i<count_events;i++){
				let event=component.schema.events[i];
				if( (this.timestep%event.interval)==0 && event.condition(component.state)){
					event.action(component.state);

				}
			}
		}
	}

}