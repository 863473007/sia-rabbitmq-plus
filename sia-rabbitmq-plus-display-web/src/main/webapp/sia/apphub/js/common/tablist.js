/**
 * 通用型展示List
 */
function AppHubTabList(_config) {
	
	var config= {
		id:"",     //id
		cid:"",    //容器id
		pkey:"",    //用于定位行的唯一键, 也可以接受一个function实现动态处理
		templ: undefined,//function(nodeData) {} 用于生成node的函数, 如果为空则使用默认模板
		init:false,
		style:"Light",
		width:230,
		group:{
		   getId:undefined, //function(nodeData) {} 用于生成group id
		   match:undefined  //function(nodeDiv,nodeData) {} 用于匹配是否node放入该group中
		}		
	};
	
	var dataObjs={
			
	};
	
	var groupObjs={
			
	};
	
	JsonHelper.merge(config, _config, true, false);
	
	/**
	 * _data= [
	 *    {
	 *       field1:
	 *       field2:
	 *       ....
	 *       field3:
	 *    },
	 *    ...
	 * ]
	 */
	this.load=function(_data,isRefreshNode) {
		
		if (config.init==false) {
			
			config.init=true;
			
			var container=HtmlHelper.id(config["cid"]);
			
			if (undefined==container) {
				return;
			}
			
			var mdiv=HtmlHelper.newElem("div",{"id":config.id});
			
			container.appendChild(mdiv);
		}
		
		if (_data!=undefined&&_data.length>0) {
			
			var mdiv=HtmlHelper.id(config.id);
						
			for(var i=0;i<_data.length;i++) {
				
				var d=_data[i];
							
				var keyVal;
				
				if(typeof config.pkey == "string") {
					keyVal=d[config.pkey];
				}
				else {
					keyVal=config.pkey(d);
				}
				
				dataObjs[keyVal]=d;
									
				var nodeid=config.id+"_"+keyVal;
				
				var nodeDiv=HtmlHelper.id(nodeid);
				//build node
				if (undefined==nodeDiv) {
					nodeDiv=HtmlHelper.newElem("div",{"id":nodeid,"class":"AppHubTabListNode "+config["style"]});
					nodeDiv.style.width=config["width"]+"px";				
					
					//ungroup
					mdiv.appendChild(nodeDiv);
					nodeDiv=HtmlHelper.id(nodeid);
				}
				
				//build group
				var groupId=undefined;
				if(config.group["getId"]!=undefined) {
				   
				   groupId=config.group["getId"](d);
				   
				   //if has group id
				   if (groupId!=undefined&&groupId!="") {
				   
					   //create group elem and data
					   if (groupObjs[groupId]==undefined) {
						   var groupElemId=config["id"]+"-group-"+groupId;
						   groupDiv=HtmlHelper.newElem("div",{"id":groupElemId,"class":"AppHubTabListGroup"});
						   groupDiv.innerHTML="<div class='GroupTitle'>"+groupId+"</div>";
						   groupObjs[groupId]={elem:function() {
							   
							   return HtmlHelper.id(groupElemId);
							   
						   },members:new Map()};
						   
						   mdiv.appendChild(groupDiv);
					   }
					   
					   groupObjs[groupId].members.put(keyVal,d);
				   }				   
				}				

				//not refresh node content
				if (isRefreshNode==false) {
					continue;
				}
				
				try {
					config.templ(nodeDiv,d);
				}catch(e) {
					LogHelper.err(this, "AppHubTabList.templ RUNs FAIL.", e);
				}
			}	
		}
	};
	
	this.doGroups=function() {
		
		//group member element
		for(var key in dataObjs) {
			var d=dataObjs[key];
			
			if (d==undefined) {
				continue;
			}
			
			var groupObj=config.group["match"](groupObjs,d,dataObjs);
			
			if (groupObj!=undefined) {
				var nodeDiv=HtmlHelper.id(config.id+"_"+key);
				HtmlHelper.del(config.id+"_"+key);
				groupObj.elem().appendChild(nodeDiv);
			}
		}		
		
		//delete group withour any member
		for(var key in groupObjs) {
			
			var gpElemId=config.id+"-group-"+key;
			
			var gpElem=HtmlHelper.id(gpElemId);
			
			if (gpElem.children.length<2) {
				HtmlHelper.del(gpElemId);
				delete groupObjs[key];
			}
		}
	};
	
	this.destroy=function() {
		config["mdiv"].innerHTML="";
	};
	
	this.del=function(ids) {
		for(var i=0;i<ids.length;i++) {
			dataObjs[ids[i]]=undefined;
			HtmlHelper.del(config.id+"_"+ids[i]);
		}
	};
}
/**
 * AppHubTabListManager
 */
function AppHubTabListManager() {
	
	var list=new Map();

	this.build=function(_config) {
		var tl=new AppHubTabList(_config);
		list.put(_config["id"], tl);
	};
	
	this.doGroups=function(id) {
		var tl=list.get(id);
		if (undefined==tl) {
			return;
		}
		tl.doGroups();
	};
	
	this.load=function(id,_data,isRefreshNode) {
		var tl=list.get(id);
		if (undefined==tl) {
			return;
		}
		tl.load(_data,isRefreshNode);
	};
	
	this.del=function(id,ids) {
		if (list.contain(id)) {
			var tl=list.get(id);
			tl.del(ids);
		}
	};
	
	this.reset=function(id) {
		if (list.contain(id)) {
			var tl=list.get(id);
			tl.destroy();
			list.remove(id);
		}
	};
}

window["tablistmgr"]=new AppHubTabListManager();
