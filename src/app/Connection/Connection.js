import Mapper from '../Mapper/Mapper';

export default class Connection{
	constructor({src=null,target=null,mapper=Mapper.Random, type="Reset"}){		
		this.src=src;
		this.target=target;
		this.mapper=mapper;
		this.type=type;
	}
}

