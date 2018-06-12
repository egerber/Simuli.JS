import Component from '../src/app/Components/Component';
import Selector from '../src/app/Selector/Selector';
import SlidingAverage from '../src/app/DynamicVariables/SlidingAverage';

describe("Component",function(){

	it("Initiates without Error", function(){
		let component=new Component();
	});

	it("input_links can be set to both Array and single object",function(){
		let component1=new Component();
		let component2=new Component();
		expect(()=>component1.input_links=component2).not.toThrow();
		expect(()=>component1.input_links=[component2]).not.toThrow();
	});

	it("state variables can be set to dynamic variables", function(){
		let component=new Component({
			init_state:{
				"timestep":new SlidingAverage(0,2) //initial value 0, interval 2
			}
		});

		component.tick();//increase timestep by 1
		expect(component.state.timestep).toBe(0.5); //instead of 1 : (0+1)/2

	});

	it("set input_links to a component",function(){
		let component1=new Component();
		let component2=new Component();
		let component3=new Component();
		let component_multioutput=new Component({count_outputs:3});


		component1.output=0;
		component2.output=1;
		component3.output=2;

		let component4=new Component({slots_input:3});
		component4.input_links=[component1,component2,component3];

		//test set input_links array
		expect(component4.input_values).toEqual([0,1,2]);

		//test set input_links single item
		component4.input_links=component1;
		expect(component4.input_values).toEqual(0);

		//test set input_links to component with multiple outputs
		let component_multi=new Component({count_outputs:3});
		component_multi.output=[0,1,2];

		component4.input_links=component_multi;
		expect(component4.input_values).toEqual([0,1,2]);

		//test adding components
		component4.input_links=[];
		component4.add_input_link(component1);
		component4.add_input_link(component2);
		component4.add_input_link(component3);
		component4.add_input_link(component3);
		expect(component4.input_values).toEqual([0,1,2]);
	});

	it("feedback flow", function(){
		let component_sender=new Component({
			compute_feedback: (target_output,state,output)=>10
		});

		let component_receiver=new Component({
			apply_feedback:function(feedback,state,output){
				state.feedback_value=feedback;
			}
		});

		component_receiver.add_feedback_link(component_sender);

		component_receiver.tick();
		expect(component_receiver.state.feedback_value).toBe(10);

	});

});