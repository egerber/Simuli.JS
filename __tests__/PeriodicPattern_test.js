import PeriodicPattern from '../src/app/Components/PatternGenerators/PeriodicPattern';

describe("Periodic Pattern Generator",function(){

	let period=3;
	let slots_input=10;

	
	it("Initialization",function(){
		expect(()=>new PeriodicPattern({slots_input,period})).not.toThrow();
	});


	it("outputs of identical inputs match",function(){	
		let inputs=Array.from({length:slots_input},()=>Math.random());

		let generator=new PeriodicPattern();

		let output_1=generator.compute_output(inputs,generator.state);
		let output_2=generator.compute_output(inputs,generator.state);

		expect(output_1).toEqual(output_2);
	});

	it("output size matches with slots_input",function(){

		let generator=new PeriodicPattern({slots_input});
		let output=generator.output;

		expect(output.length).toBe(slots_input);
	});

	
	it("period is correct", function(){
		let generator=new PeriodicPattern({slots_input,period});
		
		let output_1=generator.output;
		for(var i=0;i<period;i++){
			generator.tick();
		}

		let output_period=generator.output;
		expect(output_1).toEqual(output_period);
	});



});

