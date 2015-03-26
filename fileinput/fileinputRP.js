/*!
 * @copyright Copyright &copy;https://github.com/javahuang/fileinputRP
 * @version 0.0.1
 *
 * File input styled that utilizes HTML5 File Input's advanced 
 * features including the FileReader API.
 * css need font-awesome.css version>4.0 http://fontawesome.io/get-started/
 * 
 *
 *usage: $("#id").formdata();
 *		  $("#id").fileinputrp(option);
 * 
 * 
 * Author: huangrupeng
 * Copyright: 2015, javahuang
 */

;(function ($) {
    //"use strict";
    String.prototype.repl = function (from, to) {
        return this.split(from).join(to);
    };
    var hasFileAPISupport = function () {
        return window.File && window.FileReader;
    },
    hasFileUploadSupport = function () {
        return hasFileAPISupport && window.FormData;
    },
	getNum = function (num, def) {
            def = def || 0;
            if (typeof num === "number") {
                return num;
            }
            if (typeof num === "string") {
                num = parseFloat(num);
            }
            return isNaN(num) ? def : num;
    },
	addCss = function ($el, css) {
            $el.removeClass(css).addClass(css);
    },
	isEmpty = function (value, trim) {
            return value === null || value === undefined || value.length === 0 || (trim && $.trim(value) === '');
    },
    isChrome=function(){
    	return window.google && window.chrome;
    },
	tDiv='<div id="{divId}">\n'+
	'<span id="{showId}" title="{showTitle}">'+
	'{showIcon}&nbsp;{showText}'+
	'</span></id>\n',
	tItem='<span id="{itemId}" for="{name}">{fileName}&nbsp;<a >{itemText}</a><br></span>'
	,
	tErrMsg='<span for="{id}" class="error">{msg}</span>'
	,
	defaultLayoutTemplates = {
            mainDiv: tDiv,
			subItem:tItem,
			errSpan:tErrMsg
    },
    FileInputRP=function(element, options){
    	this.$element = $(element);
		var name=$(element).attr("name"),
		files={};
		files.size=0;
		files[name]={};
		this._files=files;
        if (hasFileAPISupport()) {
            this.init(options);
            this.listen();
        } else {
            this.$element.removeClass('file-loading');
        }
    };
    
    FileInputRP.prototype={
    	constructor: FileInputRP,
        init: function (options) {
        	var me=this,$el=me.$element;
			$.each(options, function (key, value) {
                if (key === 'maxFileCount' || key === 'maxFileSize') {
                    me[key] = getNum(value);
                }
                me[key] = value;
            });
        	me.reader = null;
            me.formdata = {};
        	var spanId=me.createContainer();
			$("#"+spanId).click(function(){
				me.showErr();
				$el.trigger("click");
			});
		
        },
        change:function(e){
        	var me=this,
				$el=me.$element,//this不能省略
				files=$el[0].files;
				me.showErr();//清除之前错误消息
				me.createItem(files);
        },
        listen:function(){
        	var me=this,$el=me.$element;
        	$el.on('change', $.proxy(me.change, me));
        	
        },
        buildFormData:function(){
        	var me=this;
        	
        },
		getDom:function(){
			var me=this,
				$el=me.$element;
				return $el[0]
		},
        getFiles:function(){//files['name']['fileid']=File 用关联数组,得到当前表单所有的文件集合 其中key为input的name值,value为
        	var files={};
			if(isEmpty(files.size)){
				files.size=0;
			}
        	return files;
        },
		showErr:function(msg){//z
		var me=this,$el=me.$element;
			$el.parent().find('.error').remove();
			if(msg){
			var errSpan=me.layoutTemplates['errSpan'].replace("{id}",$el[0].id)
				.replace("{msg}",msg);
				$el.after(errSpan);
			}
		},
		checkFileType:function(file){//判断文件类型
			var me=this,$el=me.$element,accept=$el[0].accept;
			if(!isEmpty(accept)){
				var fileTypeArray=accept.toLowerCase().split(","),
					fileType=file.name.substring(file.name.lastIndexOf("."),file.length);
				if(fileTypeArray.indexOf(fileType.toLowerCase())==-1)
					return false;
			}
			return true;
		},
		createItem:function(files){
			var me=this,__files=me._files,$el=me.$element,_maxFileSize=me.maxFileSize,
				_maxFileCount=me.maxFileCount,_name=$el.attr("name");
			var _multiple=$el.attr("multiple");
			if((isEmpty(_multiple)&&files.size==1)||(_multiple==false&&files.size==1)){
				me.showErr("不能多选");
				return;
			}
			
			$.each(files,function(index,file){
				var filename=file.name,filesize=file.size,_file=__files[_name];
				if(_maxFileSize!=0&&file.size<_maxFileSize){
					me.showErr("文件("+filename+")不能大于"+_maxFileSize+"kb");$el.val("");
					return;
				}
				if(_maxFileCount!=0&&__files.size>=_maxFileCount){
					me.showErr("不能上传超过"+_maxFileSize+"个文件");$el.val("");
					return;
				} 
				
				if(!me.checkFileType(file)){
					me.showErr("不支持的文件类型("+filename+")");$el.val("");
					return;
				}
				
				var filename=file.name;
				if(filename in _file){
					me.showErr("文件("+file.name+")已选择");$el.val("");
					return;
				}
				
				_file[filename]=file;
				me.createItemSpan(file);
				__files.size=__files.size+1;
			})
			$el.val("");
		},
		createItemSpan:function(file){
			var me=this,$el=me.$element,
			itemTemplate=me.layoutTemplates['subItem'],
			subSpan=itemTemplate.replace("{itemId}",file.name)
				.replace("{name}",file.name)
				.replace("{fileName}",file.name)
				.replace("{itemText}",me.itemText);
			var $span=$(subSpan);//
			$el.before($span);
			$span.find("a").click(function(){//添加删除事件
				me.rmid=$(this).parent().attr("id");//将需要删除对象的id绑定到me供代理事件调用
				$(this).parent().remove();
			});
			$span.find("a").click($.proxy(me.itemclick, me));
		},
		itemclick:function(){
			var me=this,rmid=me.rmid,__files=me._files,name=me.$element[0].name;
			delete __files[name][rmid];
			delete me.rmid;
			__files.size=__files.size-1;
		},
		createContainer:function(){
			var me=this,$el=me.$element;
			var id=$el.attr("id"),name=$el.attr("name");
			var spanId=id+"_span";
			var templates=me.layoutTemplates;
			var maindiv=templates['mainDiv'].replace("{divId}",id+"_div")
				.replace("{showId}",spanId)
				.replace("{showIcon}",me.fileSelectIcon)
				.replace("{showText}",me.fileSelectText)
				.replace("{showTitle}",me.buildTitle());
			$el.before(maindiv);
			addCss($("#"+id+"_span"),me.fileSelectClass);
			$el.hide();	
			return spanId;
		},
		buildTitle:function(){//创建框标题
			var me=this,$el=me.$element;
			var type=$el.attr("accept");
			if(typeof type=='undefined')
				type="任意";
			return me.fileSelectTitle.replace("{type}",type);
		}
    }
    
    $.fn.fileinputrp=function(option){
    	if (!hasFileAPISupport()) {
             return;
         }
         var args = Array.apply(null, arguments);
         args.shift();
         return this.each(function () {
             var $this = $(this),
                 data = $this.data('fileinput'),
                 options = typeof option === 'object' && option;
             if (!data) {
            	 
                 data = new FileInputRP(this, $.extend({}, $.fn.fileinputrp.defaults, options, $(this).data()));
                 $this.data('fileinput', data);
             }
             if (typeof option === 'string') {
                 data[option].apply(data, args);
             } 
         });
    }
	
	//将表单字段组装成一个FormData
	$.fn.formdata=function(option){		
		if(hasFileUploadSupport){
    		var form=$(this)[0];
        	var formdata = new FormData(form);
			//找到子元素
			this.children("input[type=file]").each(function(){
				if($(this).data('fileinput')){
					var fileinputdata=$(this).data('fileinput')._files;
					for(key in fileinputdata){
						var name=key,files=fileinputdata[key];
						console.log(name)
						for(filename in files){
							var file=files[filename];
							console.dir(file)
							formdata.append(name,file);
						}
					}
				}
			})
        	return formdata;
    	}else{
			return;
		}
	}
    //默认配置参数
    $.fn.fileinputrp.defaults = {
    	maxFileSize:0,//默认文件大小 kb
    	maxFileCount:0,//默认文件的数量
    	multiple:false,
		fileSelectIcon:'<i class="fa fa-paperclip"></i>',
		fileSelectText:'选择附件',
		fileSelectTitle:'选择{type}格式的文件',
		fileSelectClass:'',//按钮添加的样式
		layoutTemplates: defaultLayoutTemplates,
		itemClass:'',
		itemText:'点击删除'
    }
	$.formdata={};
})(window.jQuery);

  
