# Simuli.JS

Simuli.JS is an open source framework for modeling and simulating systems in discrete time. It designed to build and simulate complex interactive systems while monitoring the internal flow of information and internal system states. The framework provides easy constructs to define the behavior of individual components as well as the rules by which they are connected and reconnected. This makes the framework ideal for studying principles of learning and self organization.


### Features
- generic constructs to define components with flexible behavior
- simulating systems with interacting components
- dynamic population change 
- dynamic change of connectivity
- logging statistics over information flow and system states

## Installation and Use
`npm install simulijs`

import in javascript via
```javascript
import {Session} from 'simulijs';

let session=new Session("my_new_session")
...
```

## Introduction
A system is a collection of components which interact with each other and create a synergistic whole. This framework differentiates two different types in which components can connect 

Components within a system can interact with each other by sending and receiving signals. There are two different types of connections that can exist between components
- **feedforward connections** 
	- at every discrete timestep, a component receives feddforward signals from all of its connected (input) components. The component then processes the information and computes a value which is propagated to all (output) components connecting to it
- **feedback connections** 
	- at every discrete timestep, a component receives feedback signals from all of its connected (input) components. The component itself can compute a feedback value which is propagated to all (output) components connecting to it

Connections can be either **undelayed** (the output value is propagated at the same timestep at which it is computed) or **delayed** (the output values is propagated at the next discrete timestep). 


All feedforward signals are propagated before the feedback signals. 

### ----


Consequently, each system is defined by
1. the behavior of each component participating in the system
2. the rules by which components are added and removed from and the the system
2. the rules by which components are connected and reconnected with each other

In combination, these mechanisms allow to define very complex behavior

### Component
A component is the building block of a system. Each component defines the way, how it processes input information (feedforward signals) and feedback information (feedback signals). All behavior is defined in relation to the state of the component, which can be freely defined and any modified. Furthermore a component can define a discrete set of events, which can trigger special actions under given conditions.
The behavior of a component is implemented in a "schema". It has the following structure:
```javascript
{
	init_state:{},
	compute_output,	//invoked with arguments (inputs,state)
	compute_feedback, //invoked with arguments (output,state)
	apply_feedback, //invoked with arguments (output,state,feedback)
	events:[]
}
```

- **`init_state`**
	- defines all properties of the state of a component. By default, the state a component includes the field `timestep`, which references the current discrete time step, starting at `0`.
- **`compute_output`**
	- invoked with the arguments `(inputs,state)`
	- returns the output value (feedforward) to be sent to connected components, given the array `inputs` of received feedforward signals. The output of the component can be computed in relation to the current `state`.
- **`compute_feedback`**
	- invoked with the arguments `(current_output, state)`
	- returns the feedback signal that is sent to connected components. The feedback is computed with regard to the current output of the component, as computed by `compute_output` as well as the current `state`. This allows to broadcast feedback information to other components
- **`apply_feedback`**
	- invoked with the arguments `(output,state,feedback)`
	- allows to define state updates with regard to it's own output and the `feedback_value` that was received. This method is invoked for any feedback signal received from a connected component.
- **`events`**
	- holds an array of objects of the type `Event` (see below)

#### Event
An event is defined by means of the following properties
- **`condition`** (default: `function(state){return true}`)
	* this function is invoked with the state object of the component. This method evaluates, whether or not the event gets triggered and returns true or false correspondingly.
- **`interval`** (default `1`)
 	* specifies the frequency of how often the event condition is checked or if no condition is defined, how often the event should be triggered. This property is helpful for defining regular state updates after every number of time steps
- **`action`** (default `function(state){}`)
	* this function is invoked when the event is triggered. The function gets invoked with the reference to the state and allows to call updates to the state of the component

##### Example Event
```javascript
let event={
	condition:function(state){ 
		return state.score>100
	},
	action:function(component){
		component.state.score=0,
	},
	interval:10
});
```
Description: checks every `10` timesteps if the score of the component is greater than `100`. If this is true, the score is set back to `0`. 
#### Example Schema

```javascript
let neuron_schema={
	init_state:{
		weights:Array.from({length:5}, (el)=>Math.random()),
		delta_update: 0.1,
		sum_error:0,
		last_inputs:[]
	},
	compute_output:function(inputs,state){
		state.last_inputs=inputs;

		let sum=0;
		for(let i=0;i<state.weights.length;i++){
			sum+=inputs[i]*weights[i];
		}

		return sum;
	},
	compute_feedback(output,state){
		return; //component is not sending feedback
	},
	apply_feedback(output,state,feedback){
		state.sum_error+=feedback-output;

		for(let i=0;i<state.weights.length;i++){
			if(feedback-output>0)
				state.weights[i]+=state.delta_update;
			else
				state.weights[i]-=state.delta_update;
		}
	},
	events:[
		{
			condition:(state)=>state.sum_error>10, 
			action:function(state){
				state.weights=Array.from({length:5}, (el)=>Math.random()) //initialize new weights
				state.sum_error=0; //reset error
			}
		}
	]
}
```
Description: The schema models the behavior of an artificial neuron which integrates feedforward signals by multiplying them with their respective weight. The output forms some kind of prediction. If the feedback value to the neuron is higher than this prediction, all weights are incremented, otherwise decremented. This way the prediction should become better overtime. 

If the sum of the deviation between the predicted value and the feedback value exceeds 10., the neuron resets all weights.
### System 
A system is the parent of all existing components. It is defined in the same way as a `Component`, but also has an additional property `init` (invoked with `(state)`) which is called upon the creation of the system.
A system has a `state` like a normal component but can also access all included components via `state.members`. This property is of the type `GroupContainer` and has two methods
- **`add(component_type, quantity=1, groups=null, args={})`**
	- allows to add new components to the system. `component_type` refers to the name of the component that was define in the session via `schema(name,schema)` (see paragraph `Session`). `quantity` specifies the number of components to be created. `groups` can take one string or an array of strings and specifies the groups in which the new components should be part of. `args` allows to modify or override selected properties of the component_schema to which is referred by `component_type`. The method returns an object `ComponentSelection` with all created components.
- **`select(groups)`**
	- takes a single string or an array of strings of all groups to be selected. Returns a `ComponentSelection` with all members of the specified groups.
- **`selectAll()`**
	- returns a `ComponentSelection` with all components of the system

```javascript
let system_schema={
	init_state:{
		max_number_components:10
	},
	init: function(state){
		let k=state.max_number_components;
		state.members.add("my_component",k,["my_group0","my_group1"]);
	}
}
```
Description: The schema adds `10` components of the type `"my_component"` (must be defined earlier in session) and adds it to the groups `my_group0` and `my_group1`

####  ComponentSelection
An instance of `ComponentSelection` bundles one or several components and allows to perform collective action. The following methods are supported:
 - **`apply(func)`**
 	- invokes the method `func` on all selected components. `func` is invoked with the `state` of each component.
 	- e.g. `selection.apply( (state)=>state.score++)` (increments the property score of all selected components)
 - **`filter(criterion)`**
 	- returns a filtered sub selection (type `ComponentSelection`) with respect to the given `criterion`. `criterion` is invoked with the state of each component and must return `true` or `false` for whether the component is to be filtered
 	- e.g. `selection.filter((state)=>state.score>10))` (returns a sub selection of all components with a score greater than `10`)
- **`sample(k=1)`**
	 - returns a sub selection of `k` randomly selected components.
 	- e.g. `selection.sample(10)` (returns a sub selection of `10` random elements from the current selection)
- **`max(iteratee, k)`**
 	- returns a ranked sub selection of `k` elements according to a criterion `iteratee` with descending order. `iteratee` is invoked with the `state` of each component and must return the value by which the components are ranked.
 	- e.g. `selection.max((state)=>state.score,5)` (returns a sub selection of the 5 components with the highest score)
 - **`min(iteratee, k)`**
 	- same as `max` but ranked ascending
 - **`union(selection)`**
	 - takes as argument another instance of `ComponentSelection` and returns a selection with all unique components of the two selections
 - **`remove()`**
 	- removes all selected components from the system as well as all connections from them or to them
 - **`length`**
 	- the number of selected components
 - **`elements`**
 	- returns an array of sub selections for each component
 	- e.g. `selection.elements[0]` (refers to a selection object with the first selected component)
 - **`connect({target, mapping, type, delayed, callback_connected})`**
 	- connects the elements of the current selection with the specified `target` selection
 	- returns an instance `ConnectionSelection` with all newly established connections 
 	- **`target`**: 
 		- specifies the target selection to be connected with
 	- **`mapping`** (default `(i,j)=>true`):
 		- invoked with `(i,j,state_source,state_target)` for all pairs between the components from the source selection the components from the target selection. `i` refers to the index of the source components inside the selection (e.g. `0` for the first, `1` for the second element, etc.), and `j` to the index of the target component. Similarly `state_source` and `state_target` reference the `state` of the the respective components. If the method returns `true`, the two components are connected with each other. 
 	- **`type`** (default `feedforward`): 
 		- Determines the type of connection that is established between the components. 
	 		-  `"feedforward"`: indicates that the components of the source selection send feedforward signals to the components of the target selection
	 		- `"feedback"` indicates that feedback signals are to be sent from source to target. 
	 		- `"bidirectional"` establishes a feedforward connection from source to target, and a feedback connection from target to source. This is helpful, whenever a component should receive feedback to the component to which it propagates feedforward signals.
 	- **`delayed`** (default:`false`)
 		- `true`: the source component sends a feedforward or feedback signal at the same timestep at which it is computed. When this option is used, it should be made sure, that no cyclic connection between the source and target component exist, otherwise the signal values cannot be resolved.
		- `false`: the source component sends a feedforward or feedback signal at the next timestep after it was computed. This option prevents any problems from cyclic connections.
	- **`callback_connected`** (default `()=>null`)
		- is invoked with `(state_source, state_target)` of all pairs that are to be connected (all pairs for which mapping returned `true`)

#####  Example Connection
```javascript
	selection_source.connect({
        target: selection_target,
        type: "feedforward",
        mapping: (i,j,state_source,state_target)=>state_source.score>state_target.score,
        delayed: true,
        callback_connected: (state_source, state_target)=>state_target.count_input_connections++
	})
```
Description: connects all pairs of components from the source selection and target selection where the source component has a smaller score than the target component. For every established connection between the source and the target selection, the target component increments `count_input_connections`
	

#### ConnectionSelection
An instance of `ConnectionSelection` bundles one or several connections between components and allows to perform collective action on them. The following methods are supported:
- **`apply(func)`**
	- invokes the method `func` on the selected connections. `func` is invoked with the `(state_source,state_target`) of each connection.
 	- e.g. `selection.apply( (s1,s2)=>s1.score++)` (increments the property score of the source component of all selected connections)
 - **`filter(criterion)`**
 	- returns a filtered sub selection (type `ConnectionSelection`) with respect to the given `criterion`. `criterion` is invoked with `(state_source,state_target`) of each connection and must return `true` or `false` for whether the connection is to be filtered
	 - e.g. `selection.filter((s1,s2)=>s2.score>10))` (returns a sub selection of all connections with the target component's score greater than 10)
 - **`sample(k=1)`**
 	- returns a random sub selection of `k` randomly selected connections.
 	- e.g. `selection.sample(10)` (returns a sub selection of 10 random elements from the current selection)
 - **`max(iteratee, k=1)`**
	 - returns a ranked sub selection of `k` elements according to a criterion `iteratee` with descending order. `iteratee` is invoked with the `(state_source,state_target`) of each connection and must return the value by which the connections are ranked.
	 - e.g. `selection.max((s1,s2)=>s1.score+s2.score,5)` (returns a sub selection of the 5 connections with the highest sum of scores between the source and the target component)
- **`min(iteratee, k=1)`**
 	- same as `max` but ranked ascending
- **`union(selection)`**
 	- takes as argument another instance of `ConnectionSelection` and returns a selection with all unique connections of the two selections
 - **`remove()`**
 	- deletes all selected connections
 - **`length`**
	 - the number of selected connections
 **`elements`**
 	- returns an array of sub selections for each connection
 	- e.g. selection.elements[0] refers to a selection object with the first selected connection
 
##### Example
```javascript
let system_schema={
	init_state={},
	init:function(state){
    	let inputs=state.members.add("input",100,["inputs"]);
     	let synapses=state.members.add("synapse",100, ["synapses"]);
		let neurons=state.members.add("neuron", 20, ["neurons"]);
       
        ... //connecting inputs with synapses, synapses with neurons
	},
	events:[
		{
			interval:50,
			action:function(state){
				let looser_synapses=state.members.select("synapses").filter((state)=>state.score<0);
				let looser_neurons=state.members.select("neurons").min((state)=>state.score,looser_synapses.length);

				looser_synapses.output_connections("feedforward").remove();
				looser_synapses.connect({
					target:looser_synapses,
				    type:"bidirectional",
				    mapping: (i,j)=>i==j,
				    delayed: false
				    callback_connect:function(state_synapse,state_neuron){
				        state_synapse.score=0;
				        state_neuron.score=0;
				    }
				}
			}
		},
		{
			interval:100,
			action:function(state){
				let synapses=state.members.select("synapses");

				if(synapses.length>=50){
					synapses.min((state)=>score).remove();
				}
			}
		}
	]
}
```

Description: When initialized, the system creates 20 neuron components and 100 synapse components. Every 50 timesteps, it selects all synapses with negative score and reconnects them with the neurons which have the lowest score. The score of the involved components is reset. Also, every 100 timesteps the weakest synapse is removed untill only 50 synapses exist.
 
### Session
In order to run a simulation, a session object must be initialized via `new Session(session_name=null)` (e.g. `let session=new Session("my_session")`). The object has the following methods:
- **`schema(component_name,schema_def)`**
	- `component_name` is of type string and defines the name for the component. `schema_def` holds the schema definition for the component. By linking a component definition to a name, the system can later reference this definition when adding new components.
- **`system(system_def)`**
	- initializes the system by passing the system schema. In order to access the component schemas, the system should be defined after all the components were defined.
- **`state_monitor(selected_groups,selected_state_properties,interval=1)`**
	- adds a `StateMonitor` to the session. A state monitor logs the state properties of system components at runtime. `selected_groups` can be a string or an array of strings, referencing one or multiple groups of the system to be monitored. `selected_state_properties` is an array of strings which indicate which properties of the components states should be logged. `interval` specifies the interval at which the values are logged.
- **`activation_monitor(selected_groups,activation_type,interval=1)`**
	- adds an `ActivationMonitor` to the session. An activation monitor logs the activation of systems components at runtime. `selected_groups` can be a string or an array of strings, referencing one or multiple groups of the system to be monitored. `activation_type` can be either `"feedforward"` or `"feedback"` in order to monitor the respective type of activation in the system. `interval` specifies the interval at which the values are logged.
- **`data`**
	- returns the data of all logs


#### Example
```javascript
let input_schema={
	init_state:{}
   	...
}

let synapse_schema:{
	...
}

let neuron_schema:{
	...
}

let system_schema:{
	...
}
    

let session=new Session("neural_network")
	.schema("input", input_schema)
    .schema("synapse",synapse_schema)
    .schema("neuron",neuron_schema)
    .system(system_schema)
    .state_monitor(["neurons","synapses"],["score"],1)
    .activation_monitor(["inputs", "neurons", "synapses"], "feedforward",1)
    .activation_monitor(["neurons"], "feedback", 1)
    .run(1000)
}

let data=session.data;
```
Description: First, three different component types (neuron,synapse, and input) are defined. Afterwards the system schema is specified and three monitors are added. During the simulation, the state property `score` of all neurons and synapses is logged as well as the forward signals of all components and the feedback signals of all neurons. The simulation is executed for 1000 timesteps. Last, all logged values are retrieved.

## TODO
- [ ] export/import functionality for session
- [ ] Monitoring graph of the system
- [ ] Dashboard for visualizing all monitored data
- [ ] connecting components via arbitrary long delay lines