import Mapper from '../Mapper/Mapper';

export default class Connection{
	constructor({src=null,target=null,mapper=Mapper.Random,reset=true,type="feedforward"}){		
		this.src=src;
		this.target=target;
		this.mapper=mapper;
		this.reset=reset;
		this.type=type;

	}
}

