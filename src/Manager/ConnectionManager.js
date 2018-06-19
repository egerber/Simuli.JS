export default class ConnectionManager{

	static count_instances=0; //refers to the number of created edges, iterates in order to generate unique ids
	static active_session=null;

	static add_connection(source,target,delay,type){
		//update state.count_connections
		return ConnectionManager.active_session.computational_graph.add_connection(source,target,delay,type);
	}

	static remove_connection(id){
		//update state.count_connections
		ConnectionManager.active_session.computational_graph.remove_connection(id);
	}

	static add_node(node){
		ConnectionManager.active_session.computational_graph.add_node(node);
	}

	static remove_node(node){
		ConnectionManager.active_session.computational_graph.remove_node(node);
	}

	static get_in_ids(node,type){
		return ConnectionManager.active_session.computational_graph.get_in_ids(node,type);
	}

	static get_out_ids(node,type){
		return ConnectionManager.active_session.computational_graph.get_out_ids(node,type);
	}

	static get_in_connections(node,type){
		return ConnectionManager.active_session.computational_graph.get_in_connections(node,type);
	}
	static get_out_connections(node,type){
		return ConnectionManager.active_session.computational_graph.get_out_connections(node,type);
	}

	static resolve_connection(id){
		return ConnectionManager.active_session.computational_graph.resolve_connection(id);
	}

	static set_active_session(session){
		ConnectionManager.active_session=session;
	}

}