import _ from 'lodash';
import ConnectionManager from '../Manager/ConnectionManager';

const INDEX_FROM=0;
const INDEX_TO=1;
const INDEX_DELAY=2;


export default class DirectedGraph{

	constructor(name){
		this.name=name; //used internally for callback (feedback vs feedforward)

		this._current_connection_id=0; //iterating ids for connection

		this._order=[]; //lists of nodes that need to be called in order

		this.connections={}; //saves id-> [node_from, node_to, delay]

		this.adj_list_out={}; //{id1:[id_con1, id_con2]}
		this.adj_list_in={};

		this._callback_connection_added=null;
		this._callback_connection_removed=null;

	}

	//changes position of indices in array so that element of index1 occurs before element of index2
	move_before(arr, index1, index2){
		if(index1<index2){
			return;
		}

	    let element=arr.splice(index1, 1)[0];
	    arr.splice(index2, 0, element);
	}

	//changes position of indices in array so that element of index1 occurs after element of index2
	move_after(arr, index1, index2){
		if(index1>index2){
			return;
		}

		let element=arr.splice(index1,1)[0];
		arr.splice(index2+1,0,element);
	}

	get_out_connections(node){
		return this.adj_list_out[node].map(id=>this.connections[id]);
	}

	get_in_connections(node){
		return this.adj_list_in[node].map(id=>this.connections[id]);
	}
/*
	get_in_edges(node){
		return this.adj_list_in[node].map(id=>this.connections[id][INDEX_FROM]);
	}

	get_out_edges(node){
		return this.adj_list_out[node].map(id=>this.connections[id][INDEX_TO]);
	}*/

	get_order(node){
		return this.order.indexOf(node);
	}

	add_node(node){
		this.adj_list_out[node]=[];
		this.adj_list_in[node]=[];

		//set order
		this.order.push(node);
	}

	add_edge(node_from, node_to,delay){
		let id=ConnectionManager.count_instances;
		ConnectionManager.count_instances++;

		this.connections[id]=[node_from,node_to,delay];

		this.adj_list_out[node_from].push(id);
		this.adj_list_in[node_to].push(id);

		//manage new order of node in computational graph
		if(delay==0){
			let ord_node_to=this.get_order(node_to);
			let ord_node_from=this.get_order(node_from);

			if(ord_node_from>ord_node_to){ //if node_to has higher order than node_from, decrease order from node_from to be smaller than the recipient node
				this.move_before(this.order,ord_node_from, ord_node_to);
			}//else keep order
		}

		if(this._callback_connection_added!=null){
			this._callback_connection_added(id,node_from,node_to,delay,this.name);
		}

		return id;
	}

	remove_edge(id){
		let connection=this.connections[id];

		if(connection===undefined){
			return;
		}

		//manage new order of node computational graph
		if(connection[INDEX_DELAY]==0){//delay

			let ord_from=this.get_order(connection[INDEX_FROM]);
			let in_connections=this.get_in_connections(connection[INDEX_FROM]);

			let orders=in_connections.map(con=>this.get_order(con[INDEX_FROM]));
			let max_in_ord=_.max(orders);

			if(max_in_ord>ord_from){//if child has higher order than parent (child -> parent), set order of parent higher than child
				this.move_after(this.order,ord_from,max_in_ord)
			}//else: keep order
		}

		let id_from=connection[INDEX_FROM];
		let id_to=connection[INDEX_TO];

		let adj_in=this.adj_list_in[id_to];
		let adj_out=this.adj_list_out[id_from];

		adj_out.splice(adj_out.indexOf(id),1);
		adj_in.splice(adj_in.indexOf(id),1);

		delete this.connections[id];

		if(this._callback_connection_removed!=null){
			this._callback_connection_removed(id,this.name);
		}
	}

	remove_node(node){

		//remove all out_connections
		let out_connections=this.adj_list_out[node].slice();
		for(let connection_id of out_connections){
			this.remove_edge(connection_id);
		}

		//remove all in connections
		let in_connections=this.adj_list_in[node].slice();
		for(let connection_id of in_connections){
			this.remove_edge(connection_id);
		}

		//delete reference in order array
		this.order.splice(this.order.indexOf(node),1);

		delete this.adj_list_out[node];
		delete this.adj_list_in[node];
	}

	set order(order){
		this._order=order;
	}

	get order(){
		return this._order;
	}

	set_callback_connection_added(func){
		this._callback_connection_added=func;
	}

	set_callback_connection_removed(func){
		this._callback_connection_removed=func;
	}

}


/*
	topological order(){

		let traverse=function(node,adj_list_out,list_visited,list_sorted){
			if(list_visited.indexOf(node)==-1){
				list_visited.push(node);
				for(let branch of adj_list_out[node]){
					traverse(branch,adj_list_out,list_visited,list_sorted);
				}
				list_sorted.push(node);
			}
		}

		let nodes=_.keys(this.adj_list_out).map(x=>_.toInteger(x));

		//start with the lowest key (=the key that was created first)
		let list_visited=[];
		let list_sorted=[];

		for(let node of nodes){
			if(list_visited.indexOf(node)==-1){
				list_visited.push(node);
				for(let child of this.adj_list_out[node]){
					traverse(child,this.adj_list_out,list_visited,list_sorted);
				}

				list_sorted.push(node);
			}
		}

		return list_sorted.reverse();
	}
*/
