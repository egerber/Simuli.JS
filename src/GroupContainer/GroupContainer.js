import ComponentSelection from '../Selection/ComponentSelection';
import ComponentManager from '../Manager/ComponentManager';
import _ from 'lodash';

export default class GroupContainer{

	constructor(groups={}){
		this._groups=groups;
		this._group_names=[];
	}
	/*
	group can be a single string or an array of strings, specifying multiple group memberships
	*/
	add(component_type, quantity, groups=null,args=null){
		let ids=new Array(quantity);
		for(let i=0;i<quantity;i++){
			ids[i]=ComponentManager.add(component_type,args);
		}
		
		if(groups==null){ //if groups is not specified, default group name is the component_type
			groups=[component_type];
		}
		else if(!Array.isArray(groups)){
			groups=[groups];
		}

		for(let group_name of groups){
			if(this._group_names.indexOf(group_name)==-1){
				this._group_names.push(group_name);
				this._groups[group_name]=[];
			}

			this._groups[group_name]=this._groups[group_name].concat(ids);
		}

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
			}
		}
	}


}