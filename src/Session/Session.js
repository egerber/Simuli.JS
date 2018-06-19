import ComponentManager from '../Manager/ComponentManager';
import ConnectionManager from '../Manager/ConnectionManager';
import ComputationalGraph from '../Graph/ComputationalGraph';
import Executer from '../Executer/Executer';
import StateMonitor from '../Monitor/StateMonitor';
import ActivationMonitor from '../Monitor/ActivationMonitor';
import _ from 'lodash';

export default class Session{

	constructor(name="session_name"){
		
		this.name=name;
		this.schemas={}; //saves specifications of component types in the form {component_name: spec,...}

		this.computational_graph=new ComputationalGraph();

		this.components={}; //array of all existing instances in the current session (index referes to id)
		this.executer=new Executer();

		this.state_monitors=[];
		this.activation_monitors=[];

		ComponentManager.set_active_session(this);
		ConnectionManager.set_active_session(this);
	}

	schema(component_name, schema){
		this._validate_schema(schema);
		this.schemas[component_name]=schema;
		return this;
	}

	_validate_schema(schema){
		if(!schema.hasOwnProperty("events")){
			schema.events=[];
		}else{
			for(let event of schema.events){
				if(!event.hasOwnProperty("interval")){
					event.interval=1;
				}
				if(!event.hasOwnProperty("condition")){
					event.condition=()=>true;
				}
				if(!event.hasOwnProperty("action")){
					throw(`Error: Event must have property 'action'`);
				}
			}
		}
	}

	//logs state properties of components over time
	state_monitor(selection,states,interval=1){
		this.state_monitors.push(new StateMonitor(selection,states,interval));
		return this;
	}

	//logs output value or feedback value of components overtime
	activation_monitor(selection,type,interval=1){
		this.activation_monitors.push(new ActivationMonitor(selection,type,interval));
		return this;
	}

	system(schema){
		this._validate_schema(schema);
		this.schemas["System"]=schema;
		ComponentManager.add("System");
		return this;
	}

	monitor(monitor){
		this.monitor=monitor;
		return this;
	}

	run(iterations=1){
		ComponentManager.set_active_session(this);
		ConnectionManager.set_active_session(this);

		for(let i=0;i<iterations;i++){
			this.executer.next(this.components,this.computational_graph);
			let groups=this.components[0].state.members._groups;
			let timestep=this.components[0].state.timestep;
			
			for(let state_monitor of this.state_monitors){
				state_monitor.log(this.components,groups,timestep);
			}
			for(let activation_monitor of this.activation_monitors){
				activation_monitor.log(this.components,groups,timestep);
			}
		}
		return this;
	}
	
	get data(){
		let data={
			name:this.name,
			states:{},
			activations:{},
		}

		for(let state_monitor of this.state_monitors){
			data.states[state_monitor.selection]=state_monitor.data;
		}

		for(let activation_monitor of this.activation_monitors){
			data.activations[activation_monitor.selection]=activation_monitor.data;
		}

		return data;
	}

	//save session
	save(filename){

	}

	//loads session from file/database and returns session reference
	static restore_from(uri){

	}

}