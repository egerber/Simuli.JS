import Integrator from '../src/app/Components/Integrator';
import Input from '../src/app/Components/Input';

describe("Integrator",function(){

	it("Correct Integration",function(){
	 	let input1=new Input();
	 	let input2=new Input();
	 	let input3=new Input();

		let integrator=new Integrator({max_inputs:3});
		integrator.inputs=[input1,input2,input3];

		input1.output=0;
		input2.output=1;
		input3.output=1;

		expect(integrator.output).toBe(1);

		integrator.tick();

		input1.output=0;
		input2.output=0;
		input3.output=1;

		expect(integrator.output).toBe(0);


	});

});
