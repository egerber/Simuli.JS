import _ from 'lodash';
import Selector from '../Selector/Selector';

/*
@param iteratee: function that returns the criterion to be sorted by
@param action_winner: function(winner,quantity), called for every winner with the share from the competed value that it receives
*/
function KBest(iteratee,k=1){
	let selector=Selector.Max(iteratee);
	return function(competitors,share,action_winner){
		let winners=selector(competitors,k);
		winners.forEach( (winner) => action_winner(winner, share/winners.length));
	}
}

function Proportional(iteratee){
	return function(competitors,share,action_winner){
		let sum=_.sumBy(competitors,iteratee);

		for(let i=0;i<competitors.length;i++){
			action_winner(competitors[i],iteratee(competitors[i])/sum * share);
		}
	}
}

let Competition={
	"KBest": KBest,
	"Proportional":Proportional
};


export default Competition;