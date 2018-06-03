import Competition from '../src/app/Competition/Competition';

describe("Competition", function(){

	it("WinnerTakesAll",function(){
		var collection=[
		{
			value:1,
			share:0
		},
		{
			value:2,
			share:0
		},
		{
			value:3,
			share:0
		}];

		let competition=Competition.Proportional((obj)=>obj.value);
		competition(collection,12, (obj,quantity)=>obj.share=quantity);

		expect(collection[0].share).toBe(2);
		expect(collection[1].share).toBe(4);
		expect(collection[2].share).toBe(6);
	});

	it("Proportional", function(){

		var collection=[
		{
			value:1,
			share:0
		},
		{
			value:-2,
			share:0
		},
		{
			value:3,
			share:0
		}];

		let competition=Competition.KBest((obj)=>obj.value, 2);
		competition(collection,10,(obj,quantity)=>obj.share=quantity);

		expect(collection[0].share).toBe(5);
		expect(collection[1].share).toBe(0);
		expect(collection[2].share).toBe(5);
	});

});
