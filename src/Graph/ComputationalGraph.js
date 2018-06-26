import DirectedGraph from './DirectedGraph';

export default class ComputationalGraph{

	constructor(){
		this.graph_feedforward=new DirectedGraph("feedforward");
		this.graph_feedback=new DirectedGraph("feedback");
	}

	add_connection(src,target,delay,type){
		
		if(type=="feedforward"){
			return this.graph_feedforward.add_edge(src,target,delay);
		}else if(type=="feedback"){
			return this.graph_feedback.add_edge(src,target,delay);
		}else if(type=="bidirectional"){
			return [
				this.graph_feedforward.add_edge(src,target,delay),
				this.graph_feedback.add_edge(target,src,delay)
			]
		}else{
			throw(`Cannot add connection: connection type ${type} does not exist`);
		}
	}

	remove_connection(id){	
		//no information available which graph holds edge, therefore trigger in both graphs
		this.graph_feedforward.remove_edge(id);
		this.graph_feedback.remove_edge(id);
	}

	add_node(node){
		this.graph_feedforward.add_node(node);
		this.graph_feedback.add_node(node);
	}

	remove_node(node){
		this.graph_feedforward.remove_node(node);
		this.graph_feedback.remove_node(node);
	}

	get_in_connections(node,type){
		if(type=="feedforward"){
			return this.graph_feedforward.get_in_connections(node);
		}else if(type=="feedback"){
			return this.graph_feedback.get_in_connections(node);
		}else{
			throw(`connection type ${type} does not exist`);
		}
	}

	//the returns the connections id of all input connections to a node
	get_in_ids(node,type){
		if(type=="feedforward"){
			return this.graph_feedforward.adj_list_in[node];
		}else if(type=="feedback"){
			return this.graph_feedback.adj_list_in[node];
		}else{
			throw(`connection type ${type} does not exist`);
		}
	}

	get_out_connections(node,type){
		if(type=="feedforward"){
			return this.graph_feedforward.get_out_connections(node);
		}else if(type=="feedback"){
			return this.graph_feedback.get_out_connections(node);
		}else{
			throw(`connection type ${type} does not exist`);
		}
	}

	//the returns the connections id of all output connections to a node
	get_out_ids(node,type){
		if(type=="feedforward"){
			return this.graph_feedforward.adj_list_out[node];
		}else if(type=="feedback"){
			return this.graph_feedback.adj_list_out[node];
		}else{
			throw(`connection type ${type} does not exist`);
		}
	}

	resolve_connection(id){
		if(this.graph_feedforward.connections.hasOwnProperty(id)){
			return this.graph_feedforward.connections[id];
		}else{
			return this.graph_feedback.connections[id];
		}
	}
	
	get_order(type){
		if(type=="feedforward"){
			return this.graph_feedforward.order;
		}else if(type=="feedback"){
			return this.graph_feedback.order;
		}else{
			throw(`connection type ${type} does not exist`);
		}
	}

	set_callback_connection_added(func){
		this.graph_feedforward.set_callback_connection_added(func);
		this.graph_feedback.set_callback_connection_added(func);
	}

	set_callback_connection_removed(func){
		this.graph_feedforward.set_callback_connection_removed(func);
		this.graph_feedback.set_callback_connection_removed(func);
	}

	get order_feedback(){
		return this.graph_feedback.order;
	}

/*	
	set order_feedforward(arg){}
	set order_feedback(arg){}
*/

}