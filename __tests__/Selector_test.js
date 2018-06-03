import Selector from '../src/app/Selector/Selector';


describe("Random",function(){

	let selector=Selector.Random();

	let collection=[
	{
		"prop":20,
	},
	{
		"prop":3,
	},
	{
		"prop":11
	}];

	it("Correct Length", function(){
		expect(selector(collection,1).length).toBe(1);
		expect(selector(collection,2).length).toBe(2);
	});

	it("Returns empty Array when collection is empty",function(){
		expect(selector([],1)).toEqual([]);
	})
});


describe("Max", function(){
	let selector=Selector.Max("prop");

	let collection=[
	{
		"prop":20,
	},
	{
		"prop":3,
	},
	{
		"prop":11
	}];


	it("correct selection",function(){
		expect(selector(collection,1)).toEqual([collection[0]])
		expect(selector(collection,2)).toEqual([collection[0],collection[2]]);
	});
});	


describe("Min", function(){
	let selector=Selector.Min("prop");

	let collection=[
	{
		"prop":20,
	},
	{
		"prop":3,
	},
	{
		"prop":11
	}];

	it("correct selection",function(){
		expect(selector(collection,1)).toEqual([collection[1]])
		expect(selector(collection,2)).toEqual([collection[1],collection[2]]);
	});
})

describe("WeightedRandom",function(){

	let selector=Selector.WeightedRandom("prop");
	let collection=[
	{
		"prop":20,
	},
	{
		"prop":3,
	},
	{
		"prop":11
	}];

	it("return value exists",function(){
		let selection1=selector(collection,1);
		let selection2=selector(collection,1);
	});
});

