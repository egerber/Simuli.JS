import Ressource from '../src/app/Ressource/Ressource';
import Winner from '../src/app/Ressource/Winner';
import Equality from '../src/app/Ressource/Equality';
import Relative from '../src/app/Ressource/Relative';


class ShareHolder{
	constructor(my_property=0){
		this.value=0;
		this.my_property=my_property;
	}

	receive_ressource(value=0){
		this.value+=value;
	}
}


describe("Winner",function(){
	let ressource=new Winner({initial_value:0,inflow:function(stock_value,timestep){
		return 2;
	},property:"my_property"});

	ressource.tick();
	
	let applicant1=new ShareHolder(3);
	let applicant2=new ShareHolder(1);
	let applicant3=new ShareHolder(2);

	ressource.request(1,applicant1,(val)=>applicant1.receive_ressource(val));
	ressource.request(1,applicant2,(val)=>applicant2.receive_ressource(val));
	ressource.request(1,applicant3,(val)=>applicant3.receive_ressource(val));

	ressource.tick();

	it("correct distribution",function(){
		expect(applicant1.value).toBe(1);
		expect(applicant2.value).toBe(0);
		expect(applicant3.value).toBe(1);
	});

});

describe("Relative",function(){
	let ressource=new Relative({initial_value:0,inflow:function(stock_value,timestep){
		return 10;
	},property:"my_property"});

	let a1=new ShareHolder(6);
	let a2=new ShareHolder(3);
	let a3=new ShareHolder(1);

	ressource.tick();

	ressource.request(1,a1, (val)=>a1.receive_ressource(val));
	ressource.request(1,a2, (val)=>a2.receive_ressource(val));
	ressource.request(1,a3, a3.receive_ressource,a3);

	ressource.tick();

	it("correct distribution",function(){
		expect(a1.value).toBe(6);
		expect(a2.value).toBe(3);
		expect(a3.value).toBe(1);
	});
});

describe("Equality",function(){
	let ressource=new Equality({initial_value:0,inflow:function(stock_value,timestep){
		return 10;
	},property:"my_property"});

	let a1=new ShareHolder(6);
	let a2=new ShareHolder(3);
	let a3=new ShareHolder(1);

	ressource.tick();

	ressource.request(1,a1, (val)=>a1.receive_ressource(val));
	ressource.request(1,a2, (val)=>a2.receive_ressource(val));
	ressource.request(1,a3, a3.receive_ressource,a3);

	ressource.tick();

	it("correct distribution",function(){
		expect(a1.value).toBe(10/3);
		expect(a2.value).toBe(10/3);
		expect(a3.value).toBe(10/3);
	})

});