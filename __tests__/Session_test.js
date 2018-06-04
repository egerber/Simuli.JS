import Session from '../src/app/Session/Session';
import System from '../src/app/System/System';
import ComponentManager from '../src/app/Components/ComponentManager';
import Monitor from '../src/app/Monitor/Monitor';
import StateLogger from '../src/app/Monitor/StateLogger';
import EventLogger from '../src/app/Monitor/EventLogger';
import StructureLogger from '../src/app/Monitor/StructureLogger';
import ActivationLogger from '../src/app/Monitor/ActivationLogger';
import Event from '../src/app/Event/Event';
import Selector from '../src/app/Selector/Selector';
import Connection from '../src/app/Connection/Connection';
import Mapper from '../src/app/Mapper/Mapper';
import _ from 'lodash';

describe("Session", function(){

	it("Instantiation and Running", function(){
		let session=new Session("dynamic_system_1");

		let func_instantiate=function(){
			session
			.set_system(new System()
				.add_component("PeriodicPattern",{max_inputs:1},"input1")
				.add_component("Synapse",{},"synapse1")
				.add_component("Synapse",{},"synapse2")
				.connect("input1","synapse1")
				.connect("synapse1","synapse2")
			)
			.run(10);
		}
		
		expect(func_instantiate).not.toThrow();

	});

	it("Logging", function(){	

		let synapse_spec={
			events:[
				new Event({name:"tick",interval:1})
			]
		}

		let session=new Session("test_logging")
			.define_component("Synapse",synapse_spec)
			.set_system(new System()
				.add_component("PeriodicPattern",{max_inputs:1},"input1")
				.add_component("Synapse",synapse_spec,"synapse1")
				.add_component("Synapse",synapse_spec,"synapse2")
				.connect("input1","synapse1")
				.connect("synapse1","synapse2")
			)
			.set_monitor(new Monitor()
				.add(new StateLogger("Synapse",["score","count_0_0"],10))
				.add(new EventLogger("Synapse",["tick"]))
				.add(new ActivationLogger(["Synapse","PeriodicPattern"]))
				.add(new StructureLogger())
			)
			.run(30);

			let data=session.data;
			
			expect(data.data.events.length).toBe(60);
			expect(data.data.states.length).toBe(6);
			expect(data.data.activations.length).toBe(90);
			expect(data.data.structure.length).toBe(3);
			
	});

	it("Spiking Neural Network",function(){
		
		let pattern_generator_spec={
			max_inputs:10,
			count_outputs:10,
			period:15
		}

		let neuron_spec={
			max_inputs:5,
			count_outputs:1,
			init_state:{
				threshold:5
			},
			compute_output:function(inputs,state){ //output 1 if threshold was reached
				let sum_inputs=_.sum(inputs);

				if(sum_inputs>=state.threshold){
					return 1;
				}else{
					return false;
				}
			},
			compute_feedback:function(output,state){ //feedback is output from cell (positive or negative)
				return output;
			}
		};

		let synapse_spec={
			init_state:{
				weight:0.0,
				increment_amount:0.001, //weight increment when positive feedback
				decrement_amount:0.0005 //
			},
			max_inputs:1,
			count_outputs:1,
			compute_output:function(input,state){
				return input*state.weight;
			},
			apply_feedback:function(output,state,feedback){
				if(output==feedback){
					state.weight+=state.increment_amount;
				}else{
					state.weight-=state.decrement_amount;
				}
			},
		}

		let network_spec={
			max_inputs:10,
			count_outputs:10,
			init_state:{
			},
			events:[
				new Event({
					name:"reconnect weakes synapses",
					conition:(state)=>state.timesteps>25,
					action: function(network){
						let threshold_deletion=0.1;
						//select all synapses with a score smaller than a given threshold
						let looser_synapses=network.select("Synapse",-1,(synapse)=>synapse.state.score<threshold_deletion);

						for(let synapse of looser_synapses){
							network.delete(synapse);
						}

						let open_slots=network.select("Neuron", (neuron)=>neuron.used_inputs<neuron.max_inputs);
						network.establish_connection(new Connection({
							src:"Input",
							target:open_slots,
							mapper:Mapper.Random
						}));
					},
					init:function(){
						this.selector=Selector.Min((obj)=>obj.state.score);
					},
					interval: 10
				})
			],
			init: function(model){
				model.create("Synapse", 10);
				model.create("Neuron", 10);
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Synapse",
					mapper:Mapper.Random
				}),
				new Connection({
					src:"Synapse",
					target:"Neuron",
					mapper:Mapper.Random
				}),
				new Connection({
					src:"Neuron",
					target:"Output",
					mapper:Mapper.Linear
				})
			]
		};


		let session=new Session()
		.define_component("Neuron", neuron_spec)
		.define_component("Synapse", synapse_spec)
		.set_system(new System()
			.add_component("PeriodicPattern", pattern_generator_spec,"world")
			.add_component("Network", network_spec, "model")
			.connect("world","model")
			.connect("model","world"))
		.set_monitor(new Monitor()
				.add(new StateLogger("Synapse",["weight"],10))
				.add(new ActivationLogger(["Synapse","Neuron"])));

		console.time("SpikingNeuralNetwork")
		session.run(200);
		console.timeEnd("SpikingNeuralNetwork");
	});



});
