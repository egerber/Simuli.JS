import Components from './ComponentTypes';

export default class ComponentFactory{

	static active_session=null;

	static create(component_type,args){
			
		if(ComponentFactory.active_session==null){
			throw("Cannot create component outside of a session");
		}

		let component;
		if(ComponentFactory.active_session.specifications[component_type]!==undefined){
			component=new Components.Component({...ComponentFactory.active_session.specifications[component_type],...args},ComponentFactory.active_session);
			
		}else if(Components[component_type]!==undefined){
			component=new Components[component_type](args,ComponentFactory.active_session);
		}else{
			throw(`Error: the component type ${component_type} was not defined for the current session`);
		}
			
		//notify session of new instance
		ComponentFactory.active_session.add_component(component,component_type);
		

		return component;
		
	}	

	static set_active_session(session){
		ComponentFactory.active_session=session;
	}
}