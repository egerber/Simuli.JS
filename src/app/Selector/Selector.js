import _ from 'lodash';
//generic functions for selecting items out of arrays of objects according to specified principles

//returns the first indices of an array
var Linear=function(){
	return function(collection,quantity){
		return collection.splice(0,quantity);
	}
}

var Random=function(){
	
	return function(collection,quantity=1){
		let selection=[];

		if(collection.length>0){
			for(let i=0;i<quantity;i++){
				selection.push(collection[_.random(0,collection.length-1)]);
			}
		}

		return selection;
	};
}

var Max=function(property=null){
	
	if(property===null){
		throw("Property for Selector is not specified");
	}

	return function(collection,quantity=1){
		return _.sortBy(collection,property).slice(collection.length-quantity,collection.length).reverse();
	};
}	

var Min=function(property=null){
	
	if(property===null){
		throw("Property for Selector is not specified");
	}

	return function(collection,quantity=1){
		return _.sortBy(collection,property).slice(0,quantity);
	}
}


var WeightedRandom=function(property=null){
	
	if(property===null){
		throw("Property for Selector is not specified");
	}

	return function(collection,quantity=1){

		let sum_weights=_.sumBy(collection,property);

		let value=_.random(1,sum_weights, true); //floating number between 1 and the sum of weights

		let selection=[];

		for(let i=0;i<collection.length;i++){
			value-=collection[i][property];

			if(value<=0){
				selection.push(collection[i]);
				if(quantity==selection.length){
					break;
				}
			}
		}

		return selection;
	};
}


var Selector={
	"Min":Min,
	"Max":Max,
	"Random": Random,
	"WeightedRandom": WeightedRandom,
	"Linear": Linear
};

export default Selector;