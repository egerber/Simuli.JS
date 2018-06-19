import _ from 'lodash';
import Components from '../Components/ComponentTypes';

export default class Monitor{
	
	constructor(selected_groups){
		if(!Array.isArray(selected_groups)){
			this.selected_groups=[selected_groups]
		}else{
			this.selected_groups=selected_groups;
		}

	}

	log(){}

	//returns selection as string
	get selection(){
		return this.selected_groups.toString();
	}

	set data(data){}

	get data(){}

}