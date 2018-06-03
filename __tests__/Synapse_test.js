import Synapse from '../src/app/Components/Synapse';
import Input from '../src/app/Components/Input';
import Output from '../src/app/Components/Output';

describe("Synapse",function(){
	it("Initialization", function(){
		expect(() => new Synapse()).not.toThrow();
	});

	it("Synapse counts transitions",function(){
		let input=new Input();
		let synapse=new Synapse();
		let output=new Output();
		synapse.inputs=input;
		output.inputs=synapse;

		input.output=0;
		synapse.tick();
		output._receive_feedback(0);//count_0_0=1

		input.output=1;
		synapse.tick();
		output._receive_feedback(1); //count_1_1=1

		input.output=0;
		synapse.tick();
		output._receive_feedback(1);//count_0_1=1
		
		input.output=1;
		synapse.tick();
		output._receive_feedback(0);

		expect(synapse.state.count_1_1).toBe(1);
		expect(synapse.state.count_1_0).toBe(1);
		expect(synapse.state.count_0_0).toBe(1);
		expect(synapse.state.count_0_1).toBe(1);

	})
});