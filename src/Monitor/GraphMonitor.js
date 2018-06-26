import _ from 'lodash';

export default class GraphMonitor{
	constructor(){

		this.timestep=0;

		this.node_logs=[];
		this.feedforward_connection_logs=[];
		this.feedback_connection_logs=[];
		this.t=0;
	}

	tick(){
		this.t++;
	}

	notify_add_node(id,group=null){
		this.node_logs.push({
			op:"+",
			id:id,
			group:group,
			t:this.t,
		})
	}

	notify_remove_node(id){
		this.node_logs.push({
			op:"-",
			id:id,
			t:this.t
		})
	}

	notify_add_connection(id,source,target,delay,type){
		let logs;
		if(type=="feedforward"){
			logs=this.feedforward_connection_logs;
		}else if(type=="feedback"){
			logs=this.feedback_connection_logs;
		}

		logs.push({
			op:"+",
			id:id,
			source:source,
			target:target,
			delay:delay,
			t:this.t,
		});
	}

	notify_remove_connection(id,type){
		let logs;
		if(type=="feedforward"){
			logs=this.feedforward_connection_logs;
		}else if(type=="feedback"){
			logs=this.feedback_connection_logs;
		}
		
		logs.push({
			op:"-",
			id:id,
			t:this.t
		});
	}

	get data(){
		let connections_feedforward=this.feedforward_connection_logs;
		let connections_feedback=this.feedback_connection_logs;

		connections_feedforward.map(con=>con.type="feedforward");
		connections_feedback.map(con=>con.type="feedback");
		return {
			components:this.node_logs,
			connections:_.concat(connections_feedforward,connections_feedback)
				
		};
	}

}