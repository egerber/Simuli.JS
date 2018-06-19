import ConnectionManager from '../Manager/ConnectionManager';
import ComponentManager from '../Manager/ComponentManager';
import Selection from './Selection';

export default class ConnectionSelection extends Selection{

	constructor(connection_ids,type,state_tuples=[]){
		super(connection_ids,state_tuples);

		this._type=type; //type of connection e.g. feedforward or feedback
		if(this._selected_ids.length!=this._selected_states.length){
			this._selected_states=this._resolve_states(connection_ids);
		}
	}

	//removes connection
	remove(callback_removed=null){
		if(callback_removed!=null){
			this.apply(callback_removed);
		}

		for(let id of this._selected_ids){
			ConnectionManager.remove_connection(id,this._type);
		}
	}

	create_sub_selection(sub_ids,sub_states){
		let clone=Object.create(Object.getPrototypeOf(this));
		clone._selected_ids=sub_ids;
		clone._selected_states=sub_states;
		clone._type=this._type;
		return clone;
	}
	
	_resolve_states(ids){
		let state_tuples=new Array(ids.length);
		
		for(let i=0;i<ids.length;i++){
			let connection=ConnectionManager.resolve_connection(ids[i],this._type);
			state_tuples[i]=[ComponentManager.get_component(connection[0]).state,ComponentManager.get_component(connection[1]).state];
		}

		return state_tuples;
	}

}