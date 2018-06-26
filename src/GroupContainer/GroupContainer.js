import ComponentSelection from '../Selection/ComponentSelection';
import ComponentManager from '../Manager/ComponentManager';
import _ from 'lodash';

export default class GroupContainer{

	constructor(groups={}){
		this._groups=groups;
		this._group_names=[];
		this._callback_component_added=null;
		this._callback_component_removed=null;
		this._length=0;//keeping track of all count members
	}
	/*
	group can be a single string or an array of strings, specifying multiple group memberships
	*/
	add(component_type, quantity, group_name=null,args=null){
		let ids=[];
		for(let i=0;i<quantity;i++){
			ids.push(ComponentManager.add(component_type,args));
		}

		if(this._callback_component_added!=null){
			for(let id of ids){
				this._callback_component_added(id,group_name);
			}
		}
		
		if(group_name==null){ //if groups is not specified, default group name is the component_type
			group_name=component_type;
		}
		
		if(this._group_names.indexOf(group_name)==-1){
			this._group_names.push(group_name);
			this._groups[group_name]=[];
		}

		this._groups[group_name]=this._groups[group_name].concat(ids);
		
		this._length+=quantity;
		return new ComponentSelection(ids);
	}

	select(group_name=null){
		if(Array.isArray(group_name)){
			return new ComponentSelection(_.union.apply(null,group_name.map(group=>this._groups[group])));
		}else{
			return new ComponentSelection(this._groups[group_name]);
		}		
	}

	selectAll(){
		return new ComponentSelection(_.union.apply(null,_.values(this._groups)));
	}

	//remove reference to id
	_remove(id){
		for(let group_name of this._group_names){
			let index=this._groups[group_name].indexOf(id);
			if(index!==-1){
				this._groups[group_name].splice(index,1);
				break; //component can only be part of one group
			}
		}

		if(this._callback_component_removed!=null){
			this._callback_component_removed(id);
		}

		this._length--;
	}

	get length(){
		return this._length;
	}

	set_callback_component_added(func){
		this._callback_component_added=func;
	}

	set_callback_component_removed(func){
		this._callback_component_removed=func;
	}	



}