import Components from '../Components/ComponentTypes';
import DynamicVariable from '../DynamicVariables/DynamicVariable';
import ConnectionManager from './ConnectionManager';

export default class ComponentManager{

	static active_session=null;
	static count_instances=0;

	static default_state_properties={timestep: undefined}; //is managed by executer


	static initialize_dynamic_variables(state){

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

	static add(component_type,args=null){

		let session=ComponentManager.active_session;
		if(session==null){
			throw("Cannot create component outside of a session");
		}

		let id=ComponentManager.count_instances;
		ComponentManager.count_instances++; //do this here in order to have unique ids when create() is called recursively

		let schema;
		if(session.schemas.hasOwnProperty(component_type)){
			schema=session.schemas[component_type]
		}else if(Components.hasOwnProperty(component_type)){
			schema=Components[component_type];
		}else{
			throw(`component type ${component_type} is not defined (yet)`);
		}

		if(args!==null){//modify schema by custom fields
			schema={...schema,...args};
		}

		let state;

		if(component_type=="System"){
			state={...ComponentManager.default_state_properties,...schema.init_state};
			state.members=ComponentManager.active_session.group_container;

			ConnectionManager.add_node(id); //add node before init() is called, in order to have this node at the first place (=> becomes executed before any other component)
			if(schema.hasOwnProperty("init")){
				schema.init(state); //call system init function
			}

		}else{
			state={...ComponentManager.default_state_properties,...schema.init_state};
			ConnectionManager.add_node(id);
		}

		let component={
				schema:schema,
				state:state,
				current_output:undefined,
				current_feedback:undefined,
				last_output:undefined,
				last_feedback:undefined
			}

		ComponentManager.active_session.components[id]=component;
		ComponentManager.initialize_dynamic_variables(state);
		return id;
	}

	//removes component with specified id from current session
	//deletes all links from graphs as well (handled by ConnectionManager)
	static remove(id){
		//TODO apply pool method and keep instance for later instantiation
		delete ComponentManager.active_session.components[id];
		ComponentManager.active_session.components[0].state.members._remove(id);
		ConnectionManager.remove_node(id);
	}


	static get_component(id){
		return ComponentManager.active_session.components[id];
	}

	static set_active_session(session){
		ComponentManager.active_session=session;
	}
}
