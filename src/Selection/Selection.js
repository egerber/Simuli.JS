import _ from 'lodash';

export default class Selection{
	constructor(ids,states){
		this._selected_ids=ids;
		this._selected_states=states;
	}

	max(iteratee,quantity=1){

		let length_selection=Math.min(quantity,this._selected_ids.length);
		let sorted_states=new Array(length_selection);
		let sorted_ids=new Array(length_selection);

		let states=this._selected_states.slice();
		let ids=this._selected_ids.slice();

		for(let k=0;k<quantity;k++){
			//perform bubble sort over k steps
			for(let i=0;i<states.length-1;i++){
				if(iteratee.apply(null,_.flatten([states[i]]))>iteratee.apply(null,_.flatten([states[i+1]]))){
					//swap
					this._swap(states,i,i+1);
					this._swap(ids,i,i+1);
				}
			}

			sorted_states[k]=states[states.length-k-1];
			sorted_ids[k]=ids[ids.length-k-1];
		}

		return this.create_sub_selection(sorted_ids,sorted_states);
	}

	min(iteratee,quantity=1){
		let length_selection=Math.min(quantity,this._selected_ids.length);
		let sorted_states=new Array(length_selection);
		let sorted_ids=new Array(length_selection);

		let states=this._selected_states.slice();
		let ids=this._selected_ids.slice();

		for(let k=0;k<quantity;k++){
			//perform bubble sort over k steps
			for(let i=0;i<states.length-1;i++){
				if(iteratee.apply(null,_.flatten([states[i]]))<iteratee.apply(null,_.flatten([states[i+1]]))){
					//swap
					this._swap(states,i,i+1);
					this._swap(ids,i,i+1);
				}
			}

			sorted_states[k]=states[states.length-k-1];
			sorted_ids[k]=ids[ids.length-k-1];
		}

		return this.create_sub_selection(sorted_ids,sorted_states);
	}

	filter(filter_func){

		let filtered_ids=[];
		let filtered_states=[];
		for(let i=0;i<this._selected_states.length;i++){
			if(filter_func.apply(null,_.flatten([this._selected_states[i]]))){
				filtered_states.push(this._selected_states[i]);
				filtered_ids.push(this._selected_ids[i]);
			}
		}

		let sub_selected_ids=filtered_ids;
		let sub_selected_states=filtered_states;

		return this.create_sub_selection(sub_selected_ids,sub_selected_states);
	}

	create_sub_selection(sub_ids,sub_states){
		let clone=Object.create(Object.getPrototypeOf(this));
		clone._selected_ids=sub_ids;
		clone._selected_states=sub_states;

		return clone;
	}

	apply(func){
		let length=this._selected_states.length;
		for(let i=0;i<length;i++){
			func.apply(null,_.flatten([this._selected_states[i],i]));
		}

		return this;
	}

	sample(quantity=1){
		quantity=Math.min(this._selected_ids.length,quantity);

		let indices=_.range(quantity);
		let selected_indices=_.sampleSize(indices, quantity);

		let sampled_ids=new Array(quantity);
		let sampled_states=new Array(quantity);
		for(let i=0;i<quantity;i++){
			let index=selected_indices[i];
			sampled_ids[i]=this._selected_ids[index];
			sampled_states[i]=this._selected_states[index];
		}

		return this.create_sub_selection(sampled_ids,sampled_states);
	}

	union(selection){
		if(this.constructor.name!=selection.constructor.name){
			throw(`trying to union two selections of different types`);
		}

		//for performance optimization iterate over smaller selection
		let ref;
		if(this.length>=selection){
			ref=this;
		}else{
			ref=selection;
			selection=this;
		}

		let union_ids=ref._selected_ids.slice();
		let union_states=ref._selected_states.slice();
		for(let i=0;i<selection.length;i++){
			if(union_ids.indexOf(selection._selected_ids[i])==-1){
				union_ids.push(selection._selected_ids[i]);
				union_states.push(selection._selected_states[i]);
			}
		}

		return this.create_sub_selection(union_ids,union_states);
	}

		//iterates over items from selection
	[Symbol.iterator]() {
       let current_index=0;
       let length=this.length;
       let ref=this;

        return {
       		next(){
       			if(current_index<length){
	       			return {
	       				done:false,
	       				value:ref.create_sub_selection([ref._selected_ids[current_index]],[ref._selected_states[current_index++]])
	       			}
	       		}else{
	       			return {done:true}
	       		}
       		}
        }
    }

	_swap(arr,index1,index2){
			let _copy=arr[index1];
			arr[index1]=arr[index2];
			arr[index2]=_copy;
	}

	get elements(){
		let length=this._selected_ids.length;
		let sub_selections=new Array(length);
		for(let i=0;i<length;i++){
			sub_selections[i]=this.create_sub_selection([this._selected_ids[i]],[this._selected_states[i]]);
		}

		return sub_selections;
	}

	set elements(el){
		//not supported
	}

	get ids(){
 		return this._selected_ids;
 	}

 	set ids(ids){
 		//not supported
 	}

 	get states(){
 		return this._selected_states;
 	}

 	set states(arg){
 		//not supported
 	}

 	get length(){
 		return this._selected_ids.length;
 	}

 	set length(arg){
 		//not supported
 	}

}