import Mapper from '../src/app/Mapper/Mapper';

describe("Mapper",function(){
	
	it("Linear Mapper", function(){
		let arr_src=[1,2,3,4];
		let arr_target=[10,20,30,40];

		let mapping=Mapper.Linear(arr_src,arr_target);
		expect(mapping).toEqual([[1,10],[2,20],[3,30],[4,40]]);
	});

	it("Random Mapper", function(){
		let arr_src=[1,2,3,4];
		let arr_target=[10,20,30,40];

		let mapping=Mapper.Random(arr_src,arr_target);
		
		let targets=mapping.map(arr=>arr[1]);

		expect(mapping.length).toBe(4);
		expect(targets).toEqual([10,20,30,40]);
	});

	/*it("Equal Mapper", function(){
		let arr_src=[1,2];
		let arr_target=[10,20,30,40,50];

	})*/

});