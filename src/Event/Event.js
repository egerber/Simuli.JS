export default class Event{

	//name of the event, 
	constructor({name="event_",condition=(state)=>true,action=(ref)=>null,interval=1}){
		this.name=name;
		this.condition=condition;
		this.action=action;
		this.interval=interval;
	}
}