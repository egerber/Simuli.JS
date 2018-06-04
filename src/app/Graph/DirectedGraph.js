import _ from 'lodash';

export default class DirectedGraph{

	constructor(nodes=[]){
		this.adj_list={};
		for(let node of nodes){
			this.adj_list[node]=[];
		}
	}

	//returns all elements that node is connected to
	children_nodes(node){
		return this.adj_list[node];
	}

	add_node(node){
		this.adj_list[node]=[];
	}

	add_edge(node_from, node_to){
		this.adj_list[node_from].push(node_to);
		//check if cyclical
	}

	remove_edge(node_from,node_to){
		let index=this.adj_list[node_from].indexOf(node_to);
		this.adj_list[node_from].splice(index,1);
	}

	find_adjacent_nodes(node_from){
		return this.adj_list[node_from];
	}

	get_order(){

		let traverse=function(node,adj_list,list_visited,list_sorted){
			if(list_visited.indexOf(node)==-1){
				list_visited.push(node);
				for(let branch of adj_list[node]){
					traverse(branch,adj_list,list_visited,list_sorted);
				}
				list_sorted.push(node);
			}
		}

		let nodes=_.keys(this.adj_list).map(x=>_.toInteger(x));
		
		//start with the lowest key (=the key that was created first)
		let list_visited=[];
		let list_sorted=[];
		
		for(let node of nodes){
			if(list_visited.indexOf(node)==-1){
				list_visited.push(node);
				for(let child of this.adj_list[node]){
					traverse(child,this.adj_list,list_visited,list_sorted);
				}

				list_sorted.push(node);
			}
		}

		return list_sorted.reverse();
	}

	clear(){
		this.adj_list={};
	}

	path_exists(node_from, node_to){

	}

	is_cyclic(node1,node2){
		if(this.path_exists(node2,node1)&&this.path_exists(node1,node2)){
			return true;
		}else{
			return false;
		}
	}




}