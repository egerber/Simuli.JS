import Component from './Component';

export default class Input extends Component{

	constructor(...args){
		super(args);
	}

	set output(output){ //POSSIBLE: pass t as well in order to not trigger the same event twice
		this._output=output;
	}

	//return the preset value
	get output(){
		return this._output;
	}

}