import GroupContainer from '../src/GroupContainer/GroupContainer';
import Session from '../src/Session/Session';

describe("GroupContainer", function(){

	//default init code
	let session=new Session()
	.schema("component",{})
	.system({})
	.init()

	let system_state=session.components[0].state;
	
	it("add",function(){
		//add to unspecified group
		system_state.members.add("component",1);
		//add to single group
		system_state.members.add("component",2,"my_group0");
		//add to multiple groups
		system_state.members.add("component",3,"my_group1");

		expect(system_state.members.select("component").length).toBe(1);
		expect(system_state.members.select("my_group0").length).toBe(2);
		expect(system_state.members.select("my_group1").length).toBe(3);

		//add to existing groups
		system_state.members.add("component",1,"my_group1");

		expect(system_state.members.select("my_group1").length).toBe(4);
	});

	it("select",function(){
		//already handled by "add" test
	});

});

