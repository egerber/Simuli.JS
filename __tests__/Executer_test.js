import Session from '../src/Session/Session';
import Executer from '../src/Executer/Executer';
import _ from 'lodash';

describe("Executer",function(){

	let execution_time=10;

	let session=new Session()
	.schema("integrator",{
		events:[{condition:(state)=>state.timestep>=5,action:(state)=>state.count_event_triggers++}],
		init_state:{sum_feedback:0,count_event_triggers:0},
		compute_output:(inputs,state)=>_.sum(inputs),
		apply_feedback:(output,state,feedback)=>state.sum_feedback+=feedback
	})
	.schema("input",{
		compute_output:(inputs,state)=>state.timestep
	})
	.schema("output",{
		init_state:{feedback:0},
		compute_feedback:(state)=>-1
	})
	.system({
		init:function(state){
			let input=state.members.add("input",3)
			let integrator=state.members.add("integrator",3);
			let output=state.members.add("output",3).apply((state,index)=>state.feedback=index);

			input.connect({target:integrator,mapping:(i,j)=>true,delayed:true,type:"feedforward"});
			integrator.connect({target:output,mapping:(i,j)=>i==j,delayed:false,type:"bidirectional"});
		}
	})
	.run(execution_time);

	let system_state=session.components[0].state;

	it("tick",function(){
		let all_components=system_state.members.selectAll();
		expect(all_components.states.map(state=>state.timestep)).toEqual(_.fill(Array(all_components.length),execution_time-1));
		expect(system_state.timestep).toBe(execution_time-1);
	})

	it("forward propagation",function(){
		//inputs
		let input_ids=system_state.members.select("input").ids;
		let current_outputs_inputs=input_ids.map(id=>session.components[id].current_output);
		let last_outputs_input=input_ids.map(id=>session.components[id].last_output);

		expect(current_outputs_inputs).toEqual(_.fill(Array(current_outputs_inputs.length),execution_time-1));
		expect(last_outputs_input).toEqual(_.fill(Array(last_outputs_input.length),execution_time-2));

		//integrators
		let integrator_ids=system_state.members.select("integrator").ids;
		let current_outputs_integrator=integrator_ids.map(id=>session.components[id].current_output);
		let last_outputs_integrator=integrator_ids.map(id=>session.components[id].last_output);

		expect(current_outputs_integrator).toEqual(_.fill(Array(current_outputs_inputs.length),(execution_time-2)*input_ids.length)); //timestep execution_time-1 (minus delay)
		expect(last_outputs_integrator).toEqual(_.fill(Array(last_outputs_input.length),(execution_time-3)*input_ids.length));//timestep execution_time-2 (minus delay)



	});

	it("feedback propagation",function(){
		//integrators
		let integrators=system_state.members.select("integrator");
		expect(integrators.states.map(state=>state.sum_feedback)).toEqual(_.fill(Array(integrators.length),execution_time*-1));
	});

	it("event handling", function(){
		let integrators=system_state.members.select("integrator");
		expect(integrators.states.map(state=>state.count_event_triggers)).toEqual(_.fill(Array(integrators.length),execution_time-5)) //triggers at timestep>=5
	});

})