/* ========================================================================
 * ccPagi.js
 * This jquery plugin is use for set pagination more convenient and flexible
 * Copyright 2013 Cohlint
 * Released under the MIT license
 * https://github.com/Cohlint
 * v0.2.0
 * eg:
 *  $(el).ccPagi({callback: function(offset, size){} })   //init pagi event
 *  $(el).ccPagi({totalNum: number})            //update status
 * ======================================================================== */

+ function($) {
	"use strict";

	// Pagination PUBLIC CLASS DEFINITION
	// ==============================

	var Pagination = function(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, Pagination.DEFAULTS, options);
		$(element).on("click.cc.pagi", this.options.btnPrevClass, this, this.prevPage)
			.on("click.cc.pagi", this.options.btnNextClass, this, this.nextPage)
			.on("click.cc.pagi", this.options.btnFirstClass, this, this.firstPage)
			.on("click.cc.pagi", this.options.btnLastClass, this, this.lastPage)
			.on("change.cc.pagi", this.options.sltChangeSizeClass, this, this.chgsize)
			.on("click.cc.pagi", this.options.btnGotoClass, this, this.gotoPage)
			.on("keydown.cc.pagi", this.options.currPageClass, this, this.gotoPage);
	}

	Pagination.DEFAULTS = {
		totalNumClass: ".cc-total-num", //set to .text()
		totalPageClass: ".cc-total-page", //set to .text()
		currPageClass: ".cc-curr-page", //set to .val() or .text()
		btnPrevClass: ".cc-btn-prev",
		btnNextClass: ".cc-btn-next",
		btnFirstClass: ".cc-btn-first",
		btnLastClass: ".cc-btn-last",
		btnGotoClass: ".cc-btn-goto",
		sltChangeSizeClass: ".cc-slt-chgsize", //set to .val()
		pageNo: 1,
		pageSize: 10,
		totalNum: 0,
		callback: function(offset, size){}
	}

	Pagination.prototype.prevPage = function(e) {
		e.preventDefault();
		e.data.doPagination("prev");
	}

	Pagination.prototype.nextPage = function(e) {
		e.preventDefault();
		e.data.doPagination("next");
	}

	Pagination.prototype.firstPage = function(e) {
		e.preventDefault();
		e.data.doPagination("first");
	}

	Pagination.prototype.lastPage = function(e) {
		e.preventDefault();
		e.data.doPagination("last");
	}

	Pagination.prototype.gotoPage = function(e) {
		if ( (e.keyCode == 13 && e.type == "keydown") || e.type == "click") {
			e.preventDefault();
			e.data.doPagination("goto");
		}
	}

	Pagination.prototype.chgsize = function(e) {
		e.preventDefault();
		e.data.doPagination("changeSize");
	}

	Pagination.prototype.doPagination= function(type) {
		// values for update status 
		var	nextPageNumber = 1;
		var	enabled = true ;

		// related elements
		var $el = this.$element;
		var $totalNum = $el.find(this.options.totalNumClass);
		var $totalPage = $el.find(this.options.totalPageClass);
		var $currPage = $el.find(this.options.currPageClass);
		var $pageSize = $el.find(this.options.sltChangeSizeClass);

		// get values from related elements
		var currentPage = $currPage.is("input") ? $currPage.val() : $currPage.text();
		var pageSize = $pageSize.val();
		var totalNum = this.options.totalNum;

		// verify values
		pageSize = parseInt(pageSize, 10);
		pageSize = (isNaN(pageSize) || pageSize <= 0) ? "10" : pageSize;
		this.updateOptions({pageSize: pageSize});

		currentPage = parseInt(currentPage, 10);
		currentPage = (isNaN(currentPage) || currentPage <= 0) ? "1" : currentPage;

		var totalNum = this.options.totalNum;
		totalNum = parseInt(totalNum, 10);
		totalNum = (isNaN(totalNum) || totalNum <= 0) ? "0" : totalNum;

		var totalPage = Math.ceil(totalNum / pageSize) ;
		totalPage = totalPage <= 0 ? "1" : totalPage;

		//do pagination for each type
		if (type === "first") {
			nextPageNumber = 1;

			if (currentPage <= 1) {
				enabled = false;
			}

		} else if (type === "prev") {
			nextPageNumber = currentPage - 1;
			nextPageNumber = (nextPageNumber <= 0 ? 1 : nextPageNumber);

			if (currentPage <= 1) {
				enabled = false;
			}

		} else if (type === "next") {
			nextPageNumber = currentPage + 1;
			nextPageNumber = (nextPageNumber > totalPage ? totalPage : nextPageNumber);

			if (currentPage >= totalPage) {
				enabled = false;
			}

		} else if (type === "last") {
			nextPageNumber = totalPage;

			if (currentPage >= totalPage) {
				enabled = false;
			}
		} else if (type === "changeSize") {
			nextPageNumber = 1;
		} else if (type === "goto") {
			nextPageNumber = currentPage;
			
			if (currentPage > totalPage || currentPage < 1) {
				enabled = false;
			}
		} else {	//refresh
			nextPageNumber = currentPage;
			enabled = true;
		}

		//pagination result
		if(enabled){
			//disabled button for avoid repeated ajax request
			$el.find(this.options.btnPrevClass).prop("disabled", true);
			$el.find(this.options.btnNextClass).prop("disabled", true);
			$el.find(this.options.btnFirstClass).prop("disabled", true);
			$el.find(this.options.btnLastClass).prop("disabled", true);
			$el.find(this.options.sltChangeSizeClass).prop("disabled", true);
			$el.find(this.options.btnGotoClass).prop("disabled", true);
			$el.find(this.options.currPageClass).prop("disabled", true);

			//update the pageNo for display
			this.updateOptions({pageNo: nextPageNumber});

			//callback function
			this.options.callback((nextPageNumber - 1), pageSize);
		}
	}

	Pagination.prototype.updatePagi = function() {
		var $el = this.$element;
		var totalNum = this.options.totalNum;
		totalNum = parseInt(totalNum, 10);
		totalNum = (isNaN(totalNum) || totalNum <= 0) ? "0" : totalNum;
		var $totalNum = $el.find(this.options.totalNumClass);
		$totalNum.text(totalNum);

		var totalPage = Math.ceil(totalNum / this.options.pageSize);
		totalPage = totalPage <= 0 ? "1" : totalPage;
		var $totalPage = $el.find(this.options.totalPageClass);
		$totalPage.text(totalPage);

		var currPage = this.options.pageNo;
		//reset pageNo = 1
		this.updateOptions({
			pageNo: 1
		});
		if (totalNum = 0) {
			currPage = 1
		}
		var $currPage = $el.find(this.options.currPageClass);
		$currPage.is("input") ? $currPage.val(currPage) : $currPage.text(currPage);

		//enabled button for next
		$el.find(this.options.btnPrevClass).prop("disabled", false);
		$el.find(this.options.btnNextClass).prop("disabled", false);
		$el.find(this.options.btnFirstClass).prop("disabled", false);
		$el.find(this.options.btnLastClass).prop("disabled", false);
		$el.find(this.options.sltChangeSizeClass).prop("disabled", false);
		$el.find(this.options.btnGotoClass).prop("disabled", false);  
		$el.find(this.options.currPageClass).prop("disabled", false);
	}

	Pagination.prototype.updateOptions = function(options) {
		var tempData = this.$element.data("cc.pagi");
		$.extend(tempData.options, options);
		this.$element.data("cc.pagi", tempData);
		return tempData;
	}

	$.fn.ccPagi = function(option) {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data("cc.pagi");
			var options = $.isPlainObject(option) ? option : {};

			if (!data) {
				$this.data("cc.pagi", (data = new Pagination(this, options)));
			} else {
				data =  data.updateOptions(options);
			}
			data.updatePagi();
		})
	}

	$.fn.ccPagi.Constructor = Pagination;

}(jQuery);