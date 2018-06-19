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
		compute_output:(inputs,state)=>state.timestep
 	})
	.system({
		init:function(state){
			state.members.add("component",3,"group1");
			state.members.add("component",3,"group2");
		}
	})
	.state_monitor(["group1","group2"],["var1","var2"],1)
	.activation_monitor(["group1"],"feedforward")
	.run(4);

	let data=session.data;

	it("StateMonitor",function(){
		let state_data=data.states["group1,group2"];
		
		expect(state_data.length).toBe(count_iterations*6);
		expect(state_data).toContainEqual({id:1,state:[2,2],t:0});
		expect(state_data).toContainEqual({id:5,state:[2,2],t:0});
		expect(state_data).toContainEqual({id:5,state:[5,3],t:3});

	});

	it("ActivationMonitor", function(){
		let activation_data=data.activations["group1"];
		
		expect(activation_data.length).toBe(3*count_iterations);
		expect(activation_data).toContainEqual({id:1,value:0,t:0});
		expect(activation_data).toContainEqual({id:3,value:2,t:2});
		expect(activation_data).toContainEqual({id:2,value:3,t:3});
	})

})