export default class Logger{

	constructor(target){
		this.target=target;
		this.logs=[];
	}

	//is overriden by each sub-	class from Logger
	log(){
	}

	get target_type(){
		return this.target;
	}

	set logs(logs){

	}

	get_json(){

	}

	get_csv(){

	}
	
}