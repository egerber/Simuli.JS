import _ from 'lodash';

import Network from '../src/app/Components/Networks/Network';
import Components from '../src/app/Components/ComponentTypes';
import Ressource from '../src/app/Ressource/Ressource';
import Selector from '../src/app/Selector/Selector';
import Winner from '../src/app/Ressource/Winner';
import Event from '../src/app/Event/Event';
import Connection from '../src/app/Connection/Connection';
import Mapper from '../src/app/Mapper/Mapper';
import Session from '../src/app/Session/Session';

describe("Network",function(){

	//define session in order to prevent error from ComponentFactory
	let session=new Session();


	it("Initialization", function(){
		expect(()=>new Network()).not.toThrow();
	});

	it("Create new Components",function(){
		let network=new Network();

		network.create("Synapse",10,[],{});
		expect(network.groups["Synapse"].length).toBe(10);

		network.create("Component",5,["Group0","Group1"],{});
		expect(network.groups["Group0"].length).toBe(5);
		expect(network.groups["Group1"].length).toBe(5);

	});

	it("Select - invalid type",function(){
		let network=new Network({
			max_inputs:5
		});

		expect(network.select("Non_existing component")).toEqual([]);
	});

	it("Select - existing type",function(){
		let network=new Network({
			max_inputs:15
		});
		
		expect(network.select("Input",2,(input)=>input.id>5,Selector.Max("id")).length).toBe(2);
	});

	it("Adding Synapses through event",function(){
		let network=new Network({
			max_inputs:5,
			events:[
				new Event({
					name:"Add_Synapse",
					condition:(state)=>!state.groups.hasOwnProperty("synapse_pool")||state.groups["synapse_pool"].length<10,
					action:(network)=>network.create("Synapse",1,["synapse_pool"],{})
				})
			],
		});
		
		for(let i=0;i<100;i++){
			network.tick();
		}

		expect(network.select("synapse_pool",-1).length).toBe(10);
	});

	it("Establish connection between groups",function(){

		//Approach 1: connect by specifying group names of src and target pool
		let network_spec={
			max_inputs:5,
			init:function(network){
				network.create("Synapse",5,[],{})
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Synapse",
					mapper:Mapper.Linear
				})
			]
		}

		let network=new Network(network_spec);

		expect(network.groups["Synapse"].map(component=>component.hasInputs())).toEqual([true,true,true,true,true]);//all synapses have an input component set
		
		//Approac 2: connect by specifying elements for both src and target group

		let random_inputs=network.select("Input",1,(el)=>true,Selector.Random());
		let random_synapses=network.select("Synapse",1,(el)=>true,Selector.Random());
		
		network.establish_connection(new Connection({
			src:random_inputs,
			target:random_synapses,
			mapper:Mapper.Linear
		}));

		expect(random_synapses[0]._inputs).toEqual(random_inputs);


	});

	it("Deleting Inputs",function(){
		let network=new Network({
			max_inputs:10,
			init: function(network){
				network.create("Synapse",10);
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Synapse",
					mapper:Mapper.Linear
				})
			]
		})
	});


	
});

