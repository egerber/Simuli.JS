import PeriodicPattern from '../src/app/Components/PatternGenerators/PeriodicPattern';

describe("Periodic Pattern Generator",function(){

	let period=3;
	let max_inputs=10;

	
	it("Initialization",function(){
		expect(()=>new PeriodicPattern({max_inputs,period})).not.toThrow();
	});


	it("outputs of identical inputs match",function(){	
		let inputs=Array.from({length:max_inputs},()=>Math.random());

		let generator=new PeriodicPattern();

		let output_1=generator.compute_output(inputs,generator.state);
		let output_2=generator.compute_output(inputs,generator.state);

		expect(output_1).toEqual(output_2);
	});

	it("output size matches with max_inputs",function(){

		let generator=new PeriodicPattern({max_inputs});
		let output=generator.output;

		expect(output.length).toBe(max_inputs);
	});

	
	it("period is correct", function(){
		let generator=new PeriodicPattern({max_inputs,period});
		
		let output_1=generator.output;
		for(var i=0;i<period;i++){
			generator.tick();
		}

		let output_period=generator.output;
		expect(output_1).toEqual(output_period);
	});



});

