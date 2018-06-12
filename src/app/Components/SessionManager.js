

//Factory Object for creating components
//helps to keep track of all Component instances which is very useful for logging of states/connections/etc.
//helps to increase the performance of adding and removing objects by using the pool design pattern (keeping instances of deleted objects and deliver them later)
export default class SessionManager{

	static active_session=null;
	
	static add_component(component){
		if(SessionManager.active_session==null){
			throw("Error: Cannot create components outside of a session");
		}

		SessionManager.active_session.add_component(component);
	}

	static delete(component){

		if(SessionManager.active_session!=null){
			SessionManager.active_session.delete_component(component);
		}
	}

	//set the current context of the component factory
	static set_active_session(session){
		SessionManager.active_session=session;
	}

	static add_connection(id_from,id_to,type){
		SessionManager.active_session.add_connection(id_from,id_to,type);
	}

	static remove_connection(id_from,id_to,type){
		SessionManager.active_session.remove_connection(id_from,id_to,type);
	}	

	

}