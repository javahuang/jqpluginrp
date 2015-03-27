# jqpluginrp
为项目开发需要,自己添加的各种jquery插件
--2015/03/27
添加了将表单元素封装成FormData
demo:
<input id="file" type="file" name="file" multiple=true accept=".jpg,.png,.jpeg"  fileinput>
会将含有fileinput属性的file表单默认初始化为fileinput插件

var fdata=$("#form").formdata();
$.ajax({
			url:"url", 
           	type:"POST",  
           	dataType:"json",
            processData : false,  //使用ajax方式提交,必须设置为false
            contentType : false,  
           	data:fdata,
           	success:function(data){    
			}
})