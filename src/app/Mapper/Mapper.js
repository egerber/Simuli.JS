import _ from 'lodash';


//every mapper returns a collections of mapping between arr_src and arr_target, uing each target item once

//maps a random element from the src array to every target element
function Random(arr_src,arr_target){
	let map=_.times(arr_target.length,[null,null]); //initialize a multidimensional array

	for(let i=0;i<arr_target.length;i++){
		map[i]=[_.sample(arr_src),arr_target[i]];
	}

	return map;
}


//every ith element from the src array maps to the ith element from the target array
function Linear(arr_src,arr_target){
	if(arr_src.length<arr_target.length){
		throw("Linear Mapping between source and target array not possible, arr_src<arr_target");
	}

	let map=_.times(arr_target.length,[null,null]); //initialize a multidimensional array

	for(let i=0;i<arr_target.length;i++){
		map[i]=[arr_src[i],arr_target[i]];
	}

	return map;
}

//connects each target unit with each unit from the src target
//e.g. for fully connecting two layers of artificial neurons
function FullyConnect(arr_src,arr_target){

	let count_connections=arr_target.length*arr_src.length;
	let map=_times(count_connections,[null,null]);

	for(let i=0;i<count_connections;i++){
		map[i]=[arr_src[i % arr_src.length],arr_target[Math.floor(i/arr_target.length)]];
	}

	return map;
}

//every element from the src array is used equally often for mappings towards elements of the target array
function Equal(array_src,arr_target){
	let frequency_src=Math.floor(arr_target.length/src_target.length);


}

var Mapper={
	"Random": Random,
	"Linear": Linear,
	"Equal": Equal
};

export default Mapper;