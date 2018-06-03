import SlidingAverage from '../src/app/DynamicVariables/SlidingAverage';
import Custom from '../src/app/DynamicVariables/Custom';
import RandomUniform from '../src/app/DynamicVariables/RandomUniform';
import DynamicVariable from '../src/app/DynamicVariables/DynamicVariable';

describe("DynamicVariable", function(){

	it("SlidingAverage",function(){
		let sliding_var=new SlidingAverage(10,5);
		sliding_var.tick();
		sliding_var.value=20;
		expect(sliding_var.value).toBe(15);
		
		sliding_var.tick();
		sliding_var.value=30;
		sliding_var.tick();
		sliding_var.value=40;
		sliding_var.tick();
		sliding_var.value=50;
		expect(sliding_var.value).toBe((10+20+30+40+50)/5);

		sliding_var.tick();
		sliding_var.value=60;
		expect(sliding_var.value).toBe((20+30+40+50+60)/5);

	});

	it("Custom", function(){
		let custom_var=new Custom(10,(value,t)=>(t%3==0 ? 10 : 0));

		expect(custom_var.value).toBe(10);
		custom_var.tick();
		expect(custom_var.value).toBe(0);
		custom_var.tick();
		expect(custom_var.value).toBe(0);
		custom_var.tick();
		expect(custom_var.value).toBe(10);
	});


	it("RandomUniform",function(){

		let random_var=new RandomUniform(1,0.0,1.0,true);

		random_var.tick();
		let val1=random_var.value;
		random_var.tick();
		let val2=random_var.value;

		expect(val1).not.toBe(val2);
	});

	it("clone", function(){

		let variable=new DynamicVariable();
		variable["property1"]=10;

		let variable_clone=variable.clone();

		expect(variable_clone).not.toBe(variable);
		expect(variable_clone.property1).toEqual(variable.property1);

	});

});