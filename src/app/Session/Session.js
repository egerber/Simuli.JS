import ComponentManager from '../Components/ComponentManager';
import _ from 'lodash';
import DirectedGraph from '../Graph/DirectedGraph';

export default class Session{

	constructor(name="session_name",system=null,monitor=null){
		
		this.timestep=0;

		this.name=name;
		this.system=system;
		this.monitor=monitor;

		this.specifications={}; //saves specifications of component types in the form {component_name: spec,...}

		this.graph_feedforward=new DirectedGraph();
		this.graph_feedback=new DirectedGraph();

		this.instances={}; //array of all existing instances in the current session (index referes to id)

		this.component_instances={};//flat arrays of components in the current session by type
		ComponentManager.set_active_session(this);
	}

	define_component(component_name, specification){
		this.specifications[component_name]=specification;
		return this;
	}

	set_system(system){
		this.system=system;
		return this;
	}

	set_monitor(monitor){
		this.monitor=monitor;
		return this;
	}

	run(iterations=1){

		if(this.system===null){
			throw("Error: system cannot be null");
		}
		//notify component factory that all new instantiations belong to the context of this session
		ComponentManager.set_active_session(this);

		for(let i=0;i<iterations;i++){
			this.system.tick();
			this.log();
			this.timestep++;
		}

		return this;
	}

	add_component(component){
		
		this.instances[component.id]=component;
	}

	/*
	TODO: make more efficient
	*/
	delete_component(component){
		let adj_input=this.graph_feedforward.children_nodes(component.id);
		let adj_feedback=this.graph_feedback.children_nodes(component.id);

		//notify elements that receive feed forward input from the deleted component
		for(let index of adj_input){
			this.instances[index].on_input_delete(index);
		}

		//notify elements that receive feedback input from the deleted component
		for(let index of adj_feedback){
			this.instances[index].on_input_delete(index);
		}

		delete this.instances[component.id];

	}

	add_connection(id_from, id_to,type){
		if(type=="feedforward"){
			this.graph_feedforward.add_edge(id_from,id_to);
		}else if(type=="feedforward"){
			this.graph_feedback.add_edge(id_from, id_to);
		}
	}

	remove_connection(id_from,id_to,type){
		if(type=="feedforward"){
			this.graph_feedforward.remove_edge(id_from,id_to);
		}else if(type=="feedback"){
			this.graph_feedback.remove_edge(id_from,id_to);
		}
	}

	log(){
		if(this.monitor==null){
			return;
		}

		//for each state logging
		for(let state_logger of this.monitor.state_loggers){
			if(this.timestep % state_logger.interval == 0 ){
				for(let component of this.component_instances[state_logger.target_type]){
					state_logger.log(component);
				}
			}
		}

		//activation logging
		for(let activation_logger of this.monitor.activation_loggers){	
			for(let target_type of activation_logger.targets){
				for(let component of this.component_instances[target_type]){
					activation_logger.log(component); //WARNING SIDE-EFFECT: output is computed in a lazy fashion, monitor forces computation
				}
			}
		}

		//event logging
		for(let event_logger of this.monitor.event_loggers){
			for(let component of this.component_instances[event_logger.target_type]){
				event_logger.log(component);
			}
		}

		//structure logging
		for(let structure_logger of this.monitor.structure_loggers){
			for(let component of _.flatten(_.values(this.component_instances))){
				structure_logger.log(component);
			}
		}
	}

	get data(){
		if(this.monitor==null){
			return null;
		}

		return {
			name:this.name,
			data:this.monitor.data
		}
	}

	//save session
	save(filename){

	}

	//loads session from file/database and returns session reference
	static restore_from(uri){

	}


	/*
	testwise: working without objects
	*/
	tick2(){
		let order_feedback=this.graph_feedback.order;

		for(let index of order_feedback){
			let instance=this.instances[index];
			let schema=this.schemas[instance.schema_type];
			
			
		}
	}

	invoke_feedback(schema,index){
		for(let index_feedback of this.graph_feedback.inputs(index)){
			schema.apply_feedback()
		}
	}
}

/*
Container Object needed (generic component that contains arrays of components of different types)
interface

-select(type,quantity,filter)

Alternative:
-there should be a global register of all existing components in order to be able to log information without nested filter calls
-
*/