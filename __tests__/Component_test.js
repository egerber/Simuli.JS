import Component from '../src/app/Components/Component';
import Selector from '../src/app/Selector/Selector';
import SlidingAverage from '../src/app/DynamicVariables/SlidingAverage';

describe("Component",function(){

	it("Initiates without Error", function(){
		let component=new Component();
	});

	it("inputs can be set to both Array and single object",function(){
		let component1=new Component();
		let component2=new Component();
		expect(()=>component1.inputs=component2).not.toThrow();
		expect(()=>component1.inputs=[component2]).not.toThrow();
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

	it("set inputs to a component",function(){
		let component1=new Component();
		let component2=new Component();
		let component3=new Component();
		let component_multioutput=new Component({count_outputs:3});


		component1.output=0;
		component2.output=1;
		component3.output=2;

		let component4=new Component({max_inputs:3});
		component4.inputs=[component1,component2,component3];

		//test set inputs array
		expect(component4.input_values).toEqual([0,1,2]);

		//test set inputs single item
		component4.inputs=component1;
		expect(component4.input_values).toEqual(0);

		//test set inputs to component with multiple outputs
		let component_multi=new Component({count_outputs:3});
		component_multi.output=[0,1,2];

		component4.inputs=component_multi;
		expect(component4.input_values).toEqual([0,1,2]);

		//test adding components
		component4.inputs=[];
		component4.add_input(component1);
		component4.add_input(component2);
		component4.add_input(component3);
		component4.add_input(component3);
		expect(component4.input_values).toEqual([0,1,2]);
	});

});