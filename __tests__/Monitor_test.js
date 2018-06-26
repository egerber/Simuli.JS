import Session from '../src/Session/Session';
import _ from 'lodash';

describe("Monitor",function(){

	let count_iterations=4;

	let session=new Session()
	.schema("component",{
		events:[
			{interval:1,action:(state)=>state.var1++},
			{interval:2,action:(state)=>state.var2++}
		],
		init_state:{var1:1,var2:1},
		compute_output:(inputs,state)=>state.timestep,
		compute_feedback:(output,state,feedback)=>-1*state.timestep
 	})
	.system({
		init:function(state){
			let group1=state.members.add("component",3,"group1");
			let group2=state.members.add("component",3,"group2");
			group1.connect({target:group2,mapping:(i,j)=>i==j, type:"bidirectional"});
		},
		events:[
			{	
				interval:1, 
				action:function(state){
					let new_components=state.members.add("component",5,"new_group");
					new_components.connect({target:new_components,type:"feedforward"});
					let sample=state.members.select("new_group").sample(1);
					sample.input_connections("feedforward").elements[0].remove();
				}
			},
			{
				interval:2,
				action:function(state){
					//add member and directly delete it
					let new_component_del=state.members.add("component",4,"del_group").remove();
				}
			}
		]
	})
	.state_monitor(["group1","group2"],["var1","var2"],1)
	.activation_monitor(["group1"],"feedforward")
	.activation_monitor(["group2"],"feedback")
	.statistics_monitor(["group1","group2"],["var1","var2"],1)
	.graph_monitor()
	.run(4);

	let data=session.data;

	it("StateMonitor",function(){
		let state_data=data.states;
		
		expect(state_data.length).toBe(count_iterations*6*2);
		expect(state_data).toContainEqual({id:1,prop: "var1", value:2,t:0});
		expect(state_data).toContainEqual({id:1,prop: "var2", value:2,t:0});
		expect(state_data).toContainEqual({id:1,prop: "var1", value:5,t:3});		
		expect(state_data).toContainEqual({id:1,prop: "var2", value:3,t:3});
		expect(state_data.filter(obj=>obj.prop=="var1").length).toBe(count_iterations*6);
		expect(state_data.filter(obj=>obj.t==0).length).toBe(6*2);

	});

	it("ActivationMonitor", function(){
		let feedforward_data=data.feedforward;
		expect(feedforward_data.length).toBe(3*count_iterations);
		expect(feedforward_data).toContainEqual({id:1,value:0,t:0});
		expect(feedforward_data).toContainEqual({id:3,value:2,t:2});
		expect(feedforward_data).toContainEqual({id:2,value:3,t:3});

		let feedback_data=data.feedback;
		
		expect(feedback_data.length).toBe(3*count_iterations);
		expect(feedback_data).toContainEqual({id:4,value:-0,t:0});
		expect(feedback_data).toContainEqual({id:5,value:-1,t:1});
		expect(feedback_data).toContainEqual({id:6,value:-2,t:2});
	})

	it("GraphMonitor",function(){
		let graph_data=data.graph;

		expect(graph_data.connections.filter(obj=>obj.op=="-" && obj.type=="feedforward").length).toBe(4);
		expect(graph_data.components.filter(obj=>obj.op=="-").length).toBe(2*4);
	});

	it("StatisticsMonitor",function(){
		let statistics_data=data.statistics;
	
		expect(statistics_data).toContainEqual({group:"group1,group2",prop:"var1",min:2,max:2,mean:2,std:0,t:0});
		expect(statistics_data).toContainEqual({group:"group1,group2",prop:"var2",min:2,max:2,mean:2,std:0,t:0});
		expect(statistics_data).toContainEqual({group:"group1,group2",prop:"var1",min:5,max:5,mean:5,std:0,t:3});
		expect(statistics_data).toContainEqual({group:"group1,group2",prop:"var2",min:3,max:3,mean:3,std:0,t:3});

	})

})