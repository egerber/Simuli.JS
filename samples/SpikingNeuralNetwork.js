import mnist from('mnist-data');
import _ from 'lodash'

var training_data = mnist.training(0, 60000);
var testing_data = mnist.testing(0, 10000);


let input_layer_spec={
	state:{
		training_data:mnist.training(0,60000),
		testing_data:mnist.testing(0,10000)
	},
	compute_output(inputs,state){
		let index=Math.floor(state.timestep/100) //return the same value for 100 timesteps before iterating
		return state.training_data.values[index];
	},
	compute_feedback(output,state){
		let index=Math.floor(state.timestep/100)
		return state.training_data.labels[index];
	}
}

let neuron_layer_spec={
	events:[
		new Event({
			interval:100,
			action:function(state,create,select){
				let neurons_to_update=select("neuron").sort((state)=>state.score).slice(0,10)

				apply_action(neuron, (state)=>state.score=100)
				connect(src: select("input"), target:neurons_to_update, type:"feedforward", delayed:false, mapper:
			}
		})
	]
}

let neuron_spec={
	input_slots:10,
	
	state:{
		weights:Array.from({length:10},()=>_.random(-1,1,true))
	},

	compute_output(inputs,state){
		let sum=0;
		for(let i=0;i<inputs.length;i++){
			sum+=inputs[i]*state.weights[i];
		}

		return sum;
	}

	apply_feedback(output,state,feedback){

	}
}


let session=new Session("mnist_learning")
	.set_system(
		.create("input",1,"input_layer")
		.create("neuron",10, "neuron_layer")
		.connect(new Connection({
			from: "input_layer",
			to: "neuron_layer",
			type:"bidirectional",
			delay:0,
			mapper:"fullyConnect",
			reset_ports:true
		}))
//data.labels.values[0]
//data.images.values[0] (returns 28x28 matrix)