import Components from './ComponentTypes';


//Factory Object for creating components
//helps to keep track of all Component instances which is very useful for logging of states/connections/etc.
//helps to increase the performance of adding and removing objects by using the pool design pattern (keeping instances of deleted objects and deliver them later)
export default class ComponentManager{

	static active_session=null;

	static create(component_type,args){	
		//TODO implement the pool design pattern
		
		if(ComponentManager.active_session==null){
			throw("Error: Cannot create components outside of a session");
		}

		let component;
		if(ComponentManager.active_session.specifications[component_type]!==undefined){
			component=new Components.Component({...ComponentManager.active_session.specifications[component_type],...args});
			
		}else if(Components[component_type]!==undefined){
			component=new Components[component_type](args);
		}else{
			throw(`Error: the component type ${component_type} was not defined for the current session`);
		}
		
		//notify current session that new component was added
		ComponentManager.active_session.add_component(component,component_type);

		return component.id;
		
	}

	static delete(component){

		if(ComponentManager.active_session!=null){
			ComponentManager.active_session.delete_component(component);
		}
	}

	//set the current context of the component factory
	static set_active_session(session){
		ComponentManager.active_session=session;
	}

	static add_connection(id_from,id_to,type){
		ComponentManager.active_session.add_connection(id_from,id_to,type);
	}

	static remove_connection(id_from,id_to,type){
		ComponentManager.active_session.remove_connection(id_from,id_to,type);
	}	

	static get_id(id){
		return ComponentManager.active_session.instances[id];
	}

	static get_ids(ids){
		let length=ids.length;
		let selection=new Array(length);
		for(let i=0;i<length;i++){
			selection[i]=ComponentManager.active_session.instances[i];
		}

		return selection;
	}


}