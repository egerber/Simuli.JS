import ComponentManager from '../Manager/ComponentManager';
import ConnectionManager from '../Manager/ConnectionManager';
import ConnectionSelection from './ConnectionSelection';
import _ from 'lodash';
import Selection from './Selection'

export default class ComponentSelection extends Selection{

	/*
	initializes selection with a set of ids
	the corresponding states can be provided optionally and are retrieved from ComponentManager otherwise
	*/
	constructor(ids,states=[]){
		super(ids,states);

		if(this._selected_states.length!=this._selected_ids.length){
			this._selected_states=this._resolve_ids(ids);
		}
	}

	remove(){
		for(let id of this._selected_ids){
			ComponentManager.remove(id);
		}
		
		return this.create_sub_selection([],[]);
	}

	input_connections(type){
		let input_ids=[];
		for(let id of this._selected_ids){
			input_ids=input_ids.concat(ConnectionManager.get_in_ids(id,type));
		}

		//TODO get all connection ids of feedback inputs to [input_ids];
		return new ConnectionSelection(input_ids,type); //cannot use create_su_selection since new elements are involved and states must be resolved
	}

	output_connections(type){
		let input_ids=[];
		for(let id of this._selected_ids){
			input_ids=input_ids.concat(ConnectionManager.get_out_ids(id,type));
		}

		return new ConnectionSelection(input_ids,type); //cannot use create_su_selection since new elements are involved and states must be resolved
	}


	connect({
		target=null,
		type="feedforward",
		mapping=(i,j)=>true,
		delayed=false,
		reset_connections=true, 
		callback_connected=null,
	}={}){
		
		if(target==null || target.length==0){
			return;
		}

		let delay=0;
		if(delayed)
			delay=1;

		let source_states=this.states;
		let source_ids=this.ids;
		let target_states=target.states;
		let target_ids=target.ids;

		let connections=[];
		for(let i=0;i<source_ids.length;i++){
			for(let j=0;j<target_ids.length;j++){
				if(mapping(i,j,source_states[i],target_states[j])){
					//call callback (state1,state2)=>"dosomething"
					if(callback_connected!==null){
						callback_connected(source_states[i],target_states[j]);
					}
					//add to graph
					connections.push(ConnectionManager.add_connection(source_ids[i],target_ids[j],delay,type));
				}
			}
		}

		//flatten connections because add_connection with type "bidirectional "
		connections=_.flatten(connections);
		//return newly created connections
		return new ConnectionSelection(connections);
	}

	//"tunnels" directly to session and fetches states of selected ids
	_resolve_ids(){
		return this._selected_ids.map(id => ComponentManager.get_component(id).state);
	}

	

}
