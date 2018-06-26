import ComponentManager from '../Manager/ComponentManager';
import ConnectionManager from '../Manager/ConnectionManager';
import ComputationalGraph from '../Graph/ComputationalGraph';
import Executer from '../Executer/Executer';
import StateMonitor from '../Monitor/StateMonitor';
import ActivationMonitor from '../Monitor/ActivationMonitor';
import GraphMonitor from '../Monitor/GraphMonitor';
import StatisticsMonitor from '../Monitor/StatisticsMonitor';
import GroupContainer from '../GroupContainer/GroupContainer';
import _ from 'lodash';

export default class Session{

	constructor(name="session_name"){
		
		this.name=name;
		this.schemas={}; //saves specifications of component types in the form {component_name: spec,...}

		this.computational_graph=new ComputationalGraph();
		//has to be defined here in order to add references for monitor
		this.group_container=new GroupContainer();

		this.components={}; //array of all existing instances in the current session (index referes to id)
		this.executer=new Executer();

		this._state_monitors=[];
		this._activation_monitors=[];
		this._statistics_monitors=[];
		this._graph_monitor=null;

		ComponentManager.set_active_session(this);
		ConnectionManager.set_active_session(this);

		this._initialized=false;
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
	state_monitor(selection,state_properties,interval=1){
		this._state_monitors.push(new StateMonitor(selection,state_properties,interval));
		return this;
	}

	//logs output value or feedback value of components overtime
	activation_monitor(selection,type,interval=1){
		this._activation_monitors.push(new ActivationMonitor(selection,type,interval));
		return this;
	}

	graph_monitor(){
		if(this._initialized){
			throw("Graph Monitor can only be defined prior to the initialization of the system");
		}

		this._graph_monitor=new GraphMonitor();
		
		this.group_container.set_callback_component_added((...args)=>this._graph_monitor.notify_add_node(...args));
		this.group_container.set_callback_component_removed((...args)=>this._graph_monitor.notify_remove_node(...args));

		this.computational_graph.set_callback_connection_added((...args)=>this._graph_monitor.notify_add_connection(...args));
		this.computational_graph.set_callback_connection_removed((...args)=>this._graph_monitor.notify_remove_connection(...args));
		
		return this;
	}

	statistics_monitor(selection,state_properties,interval=1){
		this._statistics_monitors.push(new StatisticsMonitor(selection,state_properties,interval));
		return this;
	}

	system(schema){
		this._validate_schema(schema);
		this.schemas["System"]=schema;
		
		return this;
	}

	//adds the system
	init(){
		ComponentManager.add("System");
		return this;
	}

	run(iterations=1){

		if(!this._initialized){
			this.init();
		}

		ComponentManager.set_active_session(this);
		ConnectionManager.set_active_session(this);

		for(let i=0;i<iterations;i++){
			this.executer.next(this.components,this.computational_graph);
			let groups=this.components[0].state.members._groups;
			let timestep=this.components[0].state.timestep;
			
			for(let state_monitor of this._state_monitors){
				state_monitor.log(this.components,groups,timestep);
			}
			for(let activation_monitor of this._activation_monitors){
				activation_monitor.log(this.components,groups,timestep);
			}
			for(let statistics_monitor of this._statistics_monitors){
				statistics_monitor.log(this.components,groups,timestep);
			}
			if(this._graph_monitor!=null){
				this._graph_monitor.tick(); //special case since graph_monitor is notified for every added component/connection
			}
		}
		return this;
	}
	
	get data(){
		let data={
			name:this.name,
			states:[],
			feedforward:[],
			feedback:[],
			graph:[],
			statistics:[]
		}

		//state monitor
		data.states=_.concat(this._state_monitors.map( monitor=>monitor.data))[0];
		//feedforward activation
		data.feedforward=_.concat(this._activation_monitors.filter(monitor=>monitor.type=="feedforward").map(monitor=>monitor.data))[0];
		//feedback activation
		data.feedback=_.concat(this._activation_monitors.filter(monitor=>monitor.type=="feedback").map(monitor=>monitor.data))[0];
		//statistics
		data.statistics=_.concat(this._statistics_monitors.map(monitor=>monitor.data))[0];

		if(this._graph_monitor!=null){
			data.graph=this._graph_monitor.data;
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