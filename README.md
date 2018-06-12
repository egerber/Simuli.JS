# Discrete Dynamic Systems Framework

Dynamic System is a framework for simulating highly dynamic systems which include many interdependent components. The framework allows to define the detailed behavior of each component as well as the links through they are connected and interact with each other. When the system is simulated, all components and custom events in the system can be tracked and logged for analysis.

### Features
- defining components with specific behavior
- defining systems and simulation of interacting components
- tracking states/events of system components
- logging the flow of information inside of a system
- dynamic reconnection of components
- dynamic creation of new components at runtime

### Motivation
The framework was designed to study principles of emergence, self-organization and learning such as neuronal activity in spiking neural networks or the simulation of artifical ant colonies.
The framework aims at simplyfying the process of implementing various types of networks by providing a generic schema for the definition of the behavior of a single component. One paradigm of this framework is to separate the definition of behavior from the parameters through which the behavior is modulated.

## Introduction
A system consists of various components which interact which each other by exchanging information between each other. Since the framework is "Discrete", all behavior is defined on the basis of given time steps. The framework synchronizes all components by invoking the method `tick()` in each of them, which notifies the next timestep and triggers corresonding behavior.


A system contains components as building block
A componet is a basic element that is able to receive signals, process signals and send signals. A system is the composition of various (different) components that interact with each other to form a integrative whole. The framework provides a simple schema to define the behavior of a component and makes it possible to easily link components together. All interaction occurs at discrete timesteps. At any given point, all components send out and receive signals.
There are two types of signals that can be sent among components: feedforward signals, and feedback signals. The combination of these two types of signals allow to model all kinds of interactive systems. At any timestep, feedfoward signals are sent between components. Once all feedforward signals were sent out, feedback signals are propagated through the network. This allows for feedback loops and all kinds of learning 

### Component
Components are the key elements of the framework. The class `Component` is the base class for all members in a system. 
A component is a basic unit which receives input information at its input ports and computes an output value which is provided at it's output port. Other components can again receive input from the previous component and give output to yet another component. Besides this feed-forward flow of information, each component can send feedback-information to it's input components. That way, a network of interacting components can be defined. All exchange of information occurs at discrete timesteps.
The behavior of a component, which includes how the information is processed and how the components reacts to special events can be customized according to a fixed **schema**. In general, all information about the component is stored as a `state` object inside the component and all behavior is defined by accessing and adapting the state parameters. The schema of a component includes the following properties:
- **`max_inputs`** (default 1)
	* specifies from how many components at the same time can the component receive input information at every timestep 
- **`count_outputs`** (default 1)
	* the dimensionality of the output that the component generates and which is sent to other components
- **`init_state`** (default {})
	* the initial state object of the component (By default the state contains the current timestep)
- **`events`** (default [])
	* allows to define custom behavior (refer to Section Events)
In addition to these static attributes the schema of a component defines the feed-forward flow and feed-back flow of information through the component.
#### feed-forward information flow
- **`compute_output(inputs,state)`**
	* This essential method returns the output value of the component with regard to the current input values (outputs from input components) and the current state object. If `max_inputs=1`, inputs holds the single input value given. if `max_inputs>1`, inputs is an array which references the input value from all input components

#### feedback information flow
In addition to information that flows through the network by feeding the output value from one component into the input of another component, information can flow from the recipient to the sender as well. This direction of flow is essential for all types of feedback processes. The feedback behavior of a component can be specified through the following methods:
- **`compute_feedback(input_value,output_value,state,feedback_given)`**
	* The method calcualtes and returns the feedback value that is sent to each individual component. The method is called for each individual component at any timestep and for every received feedback signal. The feedback can be computed with regard to the `input_value` of the selected input component as well as the current output signal. Furthermore the current `state` can be referenced as well as `feedback_given`, which is the received feedback value.
- **`apply_feedack(output,this.state,feedback)`**
	* Apply_feedback allows to respond to feedback information given by another component. It is called for every single feedback value that the component has received. `feedback` holds the signal from the sender. The parameter `Output` indicates the current output value of the component, while `state` provides the reference for the current state in order to write updates to the current state of the component.

Additionally, specific events are triggered based on connection changes to the component
- **`on_input_deleted(index,state)`**
	* the method is called when the input from which the component received information (at the specified `index`) is removed
- **`on_input_changed(index, new_input,state)`**
	* this method is called whenever an input at one port was replaced by a new one.

In order to synchronize all members s of the system, the framework internally invokes `tick()` in each component and on all dynamic variables. `tick()` notifies a new timestep and triggers event checks as well as feedback calls in components. Tick is a clocking method that should not be called explicitly

#### Events
Each component can be equipped with an array of custom events. Each event triggers some sort of update to the component if a specified condition applies. An event is defined by means of the following properties
- **`name`** (default: "event_")
	* name of the event (should be defined if the event should be logged)
- **`init`** (default function(){}) 
	* constructor function for initializing properties to the event to be reused inside the action method.
- **`condition`** (default: function(state){return true})
	* this function is invoked with the state object of the component. This method evaluates, whether or not the event gets triggered and returns true or false correspondingly.
- **`action`** (default function(component){})
	* function that is called when the event is triggered. The function gets invoked with the reference to the component
- **`interval`** (default 1)
 	* specifies the frequency of how often the event condition is checked. Ideally for defining method calls after a certain number of timesteps


##### Example Schema
```javascript
let event=new Event({
	name: "my_specific_event",
	init:function(){
		this.reset_score=10;
	}
	condition:function(state){ 
		retrun state.score>100
	},
	action:function(component){
		component.state.score=this.reset_score;
	},
	interval:10
});
```
**Description**:
In this example, an event of the name "my_specific_event" is defined, which initiales a value reset_score=10 . The event condition is checked every 10 timesteps and triggers when the component score is greater than 100. In this case the method action sets the score to the predefined reset_score value. 

##### Example Schema
```javascript
let my_spec={
	count_inputs:3,
    count_outputs:1,
    init_state:{
    	accumulated_input:0
    },
    events:[
    	new Event({
        	condition: (state)=>state.accumulated_input>100
            action: (component)=>component.state.accumulated_input=0
        })
    ],
    compute_output: function(inputs,state){
    	for(let input of inputs){
        	state.accumulated_input+=input
        }
        
        return state.accumulated_input;
    },
    compute_feedback:function(input_value,output_value,state,feedback_given){
    	s
    },
    apply_feedback:function(output,state,feedback){
    
    },
    on_input_deleted: function(index,state){
    	state.accumulated_input=0;
    }
    on_input_changed:null
}

let my_component=new Component(my_spec);
```
**Description**:
T

### Network
A network is the extension of a normal component. It can be defined in the same fashion than a normal component but allows the following features:
-components:{}

- **groups**
	* Every network is a collection of a number of sub-components which are organized into groups. New groups of sub-components can be created and exsiting ones modified. (?) A component can be part in multiple groups at the same time. The use of groups is to organize sub-networks as well as to describe connections between distinct groups. By default every network component comes with two groups: "Input", and "Output". The group "Input" contains input_components in the number of the specified max_inputs, and "Output" contains Output-components in the specified number of count_output. The "Input" group is where the individual input values to the network can be accessed while "Output" set the output values from the network. 

- **`create(component_type, quantity, groups, args)`**
	* create instantiates new components and adds them into the indicated groups. component_type can refer to a pre-defined component or a locally defined component in the components_specification of the network. The network searches for the schema of that component and generates new instances in the given quantity. args (default {}) allows to override the global or local component specification (e.g. change the init_state, etc.)

- **`select(group,quantity,filter_func,selector)`**
	* helper function for selecting sub components according to certain criteria. The selection is made by reference to a group (type string). All members of the group are filtered through the custom filter function (default: (component)=>true). Afterwards the method returns the selection among the resulting members and selected by the specified selector (default: Selector.Random) and the quantity given. If quantity is -1, all resulting items after the filtering are returned regardless of the selector. The method is very useful for finding the weakest or strongest components within a group, in order to perform special operations on them (e.g. deleting, reconnecting, reinforcing, etc.)

- **`delete(component)`**
	* delete a component from the network and all of its references inside the network. Triggers on_input_deleted in all components that referenced the component as an input.

- **`init (default: function(model){})`**
	* initizialization function of the network which is evaluated before the connections between the network groups are established. The method is useful to equip the network with sub-components initially before any connectivity is applied between them.

#### Example
```javascript
let network=new Network({
	count_inputs:5,
    count_outputs:5
    })
 ```

**Description**:
TODO

### System
The system object lets you define the building blocks of your system. 

- **`add_component(component_type, args, name)`**
	 * adds a new component to the system. The argument "args" accepts the arguments (or specification) for the specified type of component. "name" allows you to reference the create component later in order to define connections between components.

- **`connect(connection_obj)`**
	* Establishes a connection between two components. The specific components from the system can be addressed by their names using the src, and target field (see section Connections). Note, that the order in which the components are appended to the system dictate the order in which information flows up and down the system. Components that are added to the system first, are the first to forward an output signal and the last to receive a feedback_signal.

#### Example
```javascript
let system=new System()
	.add_component("Input","input1")
    .add_component("Synapse","synapse1")
    .add_component("Output", "output1")
    .connect("input1","synapse1")
    .connect("synapse1","output1");
```

**Description** :
TODO


### Session
A session is the instance for running and logging a system simulation. It also keeps track of all component instances internally. A session object must be created prior to any creation of components or a system. 

Initialization:
Session initially only takes one argument "name" which is optional. 
let my_session=new Session("my_session");

- **`set_system(system)`**
	* sets the system reference for the session.
- **`set_monitor(monitor)`**
	* sets the monitor for logging the internal behavior in the system
- **`add_monitor(monitor_obj)`**
	- While the system is simulated, the activation inside the whole network can be closesly monitored using a Monitor (see Monitor paragraph below)
- **`run(iterations)`** 
	- runs (and logs) a system simulation for the specified number of iterations. Consecutive calls of run() will start at the context of the previous context. 

#### Monitor
a monitor is the collection of loggers for a session. Different types of activation and behavior can be tracked using different loggers. Currently the following loggers are supported:
- **`StateLogger(component_type, state_properties, interval)`**
	- logs the specified `state_properties` of the named `component_type` after each number of timesteps (determined by `interval`)
- **`EventLogger(component_type, events)`**
	- allows to log the occurrene of events inside components. The type of events that are logged are specified by `event_names`, which is an array of strings, refering to defined events inside a component_type.
- **`ActivationLogger(component_types)`**
	- logs the output values of all specified component_types while the simulation is running

#### Example
A session method can be created with method chaining.
```javascript
let session=new Session("session_1")
	.set_system(new System()
		.add_component("Input",{},"input1")
		.add_component("Synapse",{},"synapse1")
		.set_input_link("input1","synapse1")
	)
	.set_monitor(new Monitor()
		.add(new StateLogger("Synapse",["score", "count_0_0"],100))
		.add(new ActivationLogger("Synapse")
	)
	.run(1000)
```

***Description***:
TODO 

### Connections
Connections are objects for defining a link between two components or two groups. It is constructed by means of an object with the following fields:
- **`src`**
	* indicates the name of the sending component/group
- **`target`**
	* indicates the name of the receiving component/group
- **`mapper`**
	* specifies the method by which two arrays of components are mapped to each other
- **`type`**
	* since one component can have multiple inputs, type specifies how the new connections and old connections between components interfer.
	* **"Append"**: All existing input connections to the target component are kept. If input slots are available, new connections are appended to the component.
	* **"Reset"** (default): All existing input connections to the target component are removed before new connections are appended.

#### Mappers
Mappers are functions that take two arrays (src_array, target_array) and return a mapping between src items and target items in the fashion `[ [src[i1],target[j1], [src[i2],target[j2]], ...]`. When used in connection objects, they allow to define how components from two groups should be connected with each other.
Currently, the following types of mappers are provided:
##### Random
* connects every target item with a random src item
##### Linear
* connects the kth src item with the kth src item
##### Fully
* connects every single item from the src with every single item from target


#### Example
```javascript
let connection=new Connection({
	src:"Input",
    target:"Synapse",
    mapper: Mapper.Full,
    type: "Reset"
})
```

**Description**:
When applied, this object will add input connections to each component of the "Synapse" group with every component from the "Input" group. Previous connections for all target components will be resetted before. 


### Selectors

A selector is a function that takes the arguments `(arr, k)` and returns a sub selection of k items from the array based on the type of selector.The following types of selector functions can be generated: 

- **`Linear()`**
	- returns the k first items from the array
- **`Random()`**
	- returns a random sample of k items from the array in random order
- **`Min(iteratee)`**
	- `iteratee` is a function which is invoked for each item of the array and must return a numeric value, which defines the criterion by which the array is ordered. The selector returns the k smallest item with respect to the specified criterion
- **`Max(iteratee)`**
	- analog to Min(iteratee) but returns the k biggest items instead

#### Example
```javascript
let selector=Selectors.Min( (obj)=>obj.x);

let selection=selector([{x:10},{x:-5},{x:20}], 2) // returns [{x:-5},{x:10}]
```
**Description**: the selector returns the the two objects with the smallest value for `x`

### Competition
TODO

### Dynamic Variables
Dynamic Variables (of the type `DynamicVariable`)can be used in order to add dynamic behavior to individual state parameters of a component. DynamicVariables can be accessed, that is read and modified, in the exactly same fashion as a numeric value when it is part of the state object in a component. Outside of the state object, the value of an instance from `DynamicVariable` can be accessed and modified via the `value` attribute. 

Every class that inherits from `DynamicVariable` should override `get value(){}` and `set value(new_value){}`. If needed, the method `tick()` can be overriden in order to perform time dependent changes to the value.

Currently, the following types of DynamicVariables exist:

- **`SlidingAverage(init_value,interval)`**
	- variables of the type `SlidingAverage` always return the average of the values it was assigned over the past timesteps (specified by `interval`). For example, if the variable previously was assigned the values `10, 1, 4, 5, 2, 3` and the interval is set to `5`, the variable will output the value of `3`

- **`RandomUniform(init_value, min, max, floating=false)`**
	- the variable of this type will generate a new random value between `min` and `max` at every timestep, regardless of the value that was assigned to it. If `floating` is true, the value is a floating point number, otherwise a discrete integer.

- **`Custom(init_value=_.random(0,1),func=function(value,t){return 0}`**
	- a variable of this type can be modified by defining `func` which takes as arguments the current value of the variable and the current timestep. The output value of this variable will be the return value of `func`. The values assigned to this variable are ignored.

#### Example
**Creating a new DynamicVariable**

```javascript
class MyFuzzyVariable inherits DynamicVariable{
	constructor(init_value){
		this._value=init_value;
	}

	get value(){
		return this._value;
	}

	set value(new_value){
		this._value=new_value+Math.random(0,1);
	}
}
```
**Description**: Every time a new value is assigned to the variable, a random offset between `0` and `1` is added. The variable will output this value every time it's value is accessed. This could be useful in order to test the robustness of a parameter value.

**Using a DynamicVariable inside a component**
```javascript
let component=new Component({
	init_state:{
		difference: new DynamicVariable.SlidingAverage(0, 10) //(init_value, interval)
	},
	compute_output(input,state){
		return input+state.difference;
	},
	apply_feedback(output,state,feedback){ 
		state.difference=feedback-output;
	}
	...
});
```
**Description**: The score variable is incremented everytime, the output of the component and it's received feedback match. When the score variable is accessed, it returns the averaged value over the previous 10 timesteps. This makes the score value less prone to short term fluctiations and smoothens. 

----
## Examples
[Spiking Neural Network](./samples/SpikingNeuralNetwork.js)

## TODO
- [ ] Optimization (model.create): Pool Method for Instantiation of new Components.
- [ ] export and import of a session for reloading and continuing a system simulation

