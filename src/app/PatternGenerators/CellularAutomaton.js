import PatternGenerator from './PatternGenerator';

export default class CellularAutomaton extends PatternGenerator{

	//initialrow is passed as a string
	constructor({
		rule=30,
		initial_row="00100"
	}){
		super();
		if(rule<0 || rule>Math.pow(2,8)){
			throw 'Rule for CellularAutomaton has to be in [0,255]';
		}
		if(initial_row.length<3){
			throw 'Initial row has to be greater or equal 3';
		}
		
		this.length_row=initial_row.length

		//convert string to binary array
		this.current_row=initial_row.split('').map( character => parseInt(character));
		
		this.rule=rule;

	}

	next_row(){

		var next_row=new Array(this.length_row);
		for(var i=0;i<this.length_row;i++){
			var l,c,r;
			
			l=this.current_row[(i-1+this.length_row)%this.length_row];
			c=this.current_row[i];
			r=this.current_row[(i+1)%this.length_row];

			var n=l*4+c*2+r*1;
			
			next_row[i]=(this.rule&Math.pow(2,n))>0 ? 1 : 0;

		}

		this.current_row=next_row;
		
		return this.current_row;
	}

}