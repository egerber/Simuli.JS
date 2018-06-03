import Components from './ComponentTypes';


//Factory Object for creating components
//helps to keep track of all Component instances which is very useful for logging of states/connections/etc.
//helps to increase the performance of adding and removing objects by using the pool design pattern (keeping instances of deleted objects and deliver them later)
export default class ComponentFactory{

	static active_session=null;

	static create(component_type,args){	
		//TODO implement the pool design pattern
		
		if(ComponentFactory.active_session==null){
			throw("Error: Cannot create components outside of a session");
		}

		let component;
		if(ComponentFactory.active_session.specifications[component_type]!==undefined){
			component=new Components.Component(ComponentFactory.active_session.specifications[component_type],args);
			
		}else if(Components[component_type]!==undefined){
			component=new Components[component_type](args);
		}else{
			throw(`Error: the component type ${component_type} was not defined for the current session`);
		}
		
		//notify current session that new component was added
		if(ComponentFactory.active_session!=null){
			ComponentFactory.active_session.add_component(component,component_type);
		}

		return component;
		
	}

	static delete(component){
		if(ComponentFactory.active_session!=null){
			ComponentFactory.active_session.delete_component(component);
		}
	}

	//set the current context of the component factory
	static set_active_session(session){
		ComponentFactory.active_session=session;
	}

}